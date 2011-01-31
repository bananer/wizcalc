$(document).bind("mobileinit", function() {
    $.extend(  $.mobile , {
        defaultTransition: 'slideup',
        
    });
    
});

$(window).load(function() {

    var max_players = 6;
    var num_cards = 60;
    
    var player_names = {};
    
    var myGame;
    
    var setupPlayerSetup = function() {

        // set up player-setup-container
        $('#player-setup-container').empty();
        
        for(var i = 0; i< max_players; i++) {
            var playerEntry = $(
                '<div data-role="fieldcontain">\
        		    <input data-theme="a" type="checkbox" class="player-check" id="player-check-'+i+'" />\
            		<label for="player-check-'+i+'">Spieler '+(i+1)+'</label>\
            		<div class="player-name">\
                		<label for="player-name-'+i+'">Name:</label>\
                		<input type="text" id="player-name-'+i+'" />\
                    </div>\
                </div>');
        
            $('#player-setup-container').append(playerEntry);

            playerEntry.page();
            
        }
        
            
        
        // set up listeners that show/hide the name input
        $('#player-setup-container .player-check').change(function(ev) {
            var namebox = $(this).parent().siblings('.player-name');
            $(this).is(':checked') ? namebox.show(100) : namebox.hide(100);
        });

        // hide all for now
        $('#player-setup-container .player-check:lt(3)').attr('checked', 1);
        $('#player-setup-container .player-name:gt(2)').hide();
                
        // player-setup submit action
        $('#player-setup-submit').click(function(ev) {
            
            // set up player list 
            player_names = {};
            var n = 0;
            $('#player-setup-container .player-check:checked').each(function(i, el) {
                player_names[n] = $(el).parent()
                    .siblings('.player-name').find('input').val();
                n++;
            });
            
            if(n>2) {
            
                // Game ready...
                num_players = n;
                
                		
                $.mobile.pageLoading();	
    
                startGame();
                $.mobile.changePage($('#round-start'), 'pop', false, false);
                                
            }
            else {
                alert('Mindestens 3 Spieler!');

            }
            // ev.preventDefault();
            return false;
        });
        
   }
   
   var readScores = function(container) {
        var ret = {};
        $(container).find('fieldset').each(function(idx, el) {
            var p_id = $(el).data('playerid');
            var num = parseInt($(el).find('input:radio:checked').val(), 10);
            
            ret[p_id] = num;
        });
        return ret;
   };
    
    var fillScoreContainer = function(container, current_round, bets) {
        container.empty();
    
    
           _.each(player_names, function(p_name, p_i) {
                /*
                // slider input type:
                var player_entry =  $(
                    '<div data-role="fieldcontain">\
                        <fieldset data-role="controlgroup" data-type="horizontal">\
                        	<legend>'+p_name+'</legend>\
                        	<input type="range" id="slider-'+idx + p_i +'" data-playerid="'+p_i+'" value="0" min="0" max="20" />\
                        </fieldset>\
                    </div>'
                );*/
                
                if(bets !== undefined && p_i in bets) {
                    d_p_name = p_name + ' ('+bets[p_i]+')';                
                }
                else {
                    d_p_name = p_name;
                }
                
                
                var player_entry =  $(
                    '<div data-role="fieldcontain">\
                        <fieldset data-role="controlgroup" data-type="horizontal" data-playerid="'+p_i+'">\
                        	<legend>'+d_p_name+'</legend>\
                        </fieldset>\
                    </div>'
                );
                // radio-button input type:
                _.each(_.range(current_round+1), function(n) {
                
                    var uniqid = 'radio-' + container.attr('id') + '-' + p_i;

                    player_entry.find('fieldset')
                        .append('<input type="radio" name="'+uniqid+'" id="'+uniqid+'-'+n+'" value="'+(n)+'" '+ (n==0?'checked="checked"':'')+' />')
                        .append('<label for="'+uniqid+'-'+n+'">'+(n)+'</label>');

                });
                
            
                $(container).append(
                   player_entry
                );
                player_entry.page();
                
            });
    };
    
    var setupStartRound = function() {        
        $('#round-start').find('h1').text('Runde '+myGame.current_round+' - Start');

        var container = $('#start-container');
        
        fillScoreContainer(container, myGame.current_round);
    };
    
    var setupEndRound = function(bets) {
        $('#round-end').find('h1').text('Runde '+myGame.current_round+' - Ende');
        
        var container = $('#end-container');
        fillScoreContainer(container, myGame.current_round, bets);
    };
        
    var startGame = function() {
    
        myGame = game(num_players);
        
        setupStartRound();
        
    }
    
      
        
        
    $('#round-start-submit').click(function(ev) {
        
        var bets = readScores($('#start-container'));

        //console.log('bets:', bets);
        
        if(myGame.setBets(bets)) {
            // contine to round-end dialog

            $.mobile.pageLoading();
            setupEndRound(bets);
            $.mobile.changePage($('#round-end'), 'slide', false, false);
            
        }
        else {
            alert('Da stimmt was nicht!');
        }
    
        return false;
    });
     
    $('#round-end-submit').click(function(ev) {
        
        var scores = readScores($('#end-container'));

        //console.log('scores:', scores);
        
        if(myGame.setScores(scores)) {
            $.mobile.pageLoading();
            
            if(myGame.wasLastRound()) {
                showScoreBoard(true);
                return false;
                
            }
            
            $.mobile.pageLoading();
            setupStartRound();
            $.mobile.changePage($('#round-start'), 'slide', false, false);
        }
        else {
            alert('Da stimmt was nicht!');
        }
        
        return false;
    
    });
    
   
   
    var setupScoreBoard = function() {
        var points = myGame.calculatePoints();
        var list = [];
        
        _.each(points, function(score, p_id) {
            list.push({ name: player_names[p_id], score: score  });
        });
    
        // sort list
        list = _.sortBy(list, function(entry) {
            return -1* entry.score;
        });
        
        var container =  $('#scoreboard-container');
        container.empty();
        
        var listel = $('<ol data-inset="true" data-role="listview"/>');
        
        _.each(list, function(entry, i) {
            listel.append('<li class="scoreboard-entry"><span class="place">'+(i+1)+'.</span> <span class="name">'+entry.name+'</span> <span class="score">('+entry.score+')</span></li>');
        });
        
        container.append(listel);
        listel.page();
    };
    
    var prevPage;
    
    $('.scoreboard-button').click(function(ev) {
        showScoreBoard(false);
        return false;
        
    });
    
    var showScoreBoard = function(isFinal) {
        prevPage = $.mobile.activePage;
        
        $.mobile.pageLoading();
        setupScoreBoard();
        
        if(isFinal) {
            $('#scoreboard-restart').show();
            $('#scoreboard-close').hide();
        }
        else {
            $('#scoreboard-restart').hide();
            $('#scoreboard-close').show();        
        }
        
        $.mobile.changePage($('#scoreboard'), 'slideup', false, false);
    
    }
    
    $('#scoreboard-close').click(function(ev) {
        $.mobile.changePage(prevPage, 'slidedown', false, false);
        return false;
    });
    
    $('#scoreboard-restart').click(function(ev) {
        setupPlayerSetup();
        $.mobile.changePage($('#players'), 'pop', false, false);
        return false;
    });
    
   // first screen is the player setup
   setupPlayerSetup();
   
   
});
