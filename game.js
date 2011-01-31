
game = function(num_players) {
    var num_cards = 60;

    return {
        num_players: num_players,
        num_rounds: num_cards/num_players,
        
        current_round: 1, // == number of cards dealt
        
        bets: {
          /* [ 0, 0, 1, 0],
             [ 1, 0, 2, 1],
             [ 0, 0, 1, 2], ... */
            
        },
        
        
        betsValid: function(round_bets) {
            var belowMax = true;
            var n_r = this.current_round;
            
            _.each(round_bets, function(val) {
                if(val > n_r)
                    belowMax = false;
            });
            
            if(!belowMax) return false;
        
            // 
            var sum = _.reduce(round_bets, function(memo, num){ return memo + num; }, 0);
            if(this.current_round >= 7) {
                
                return sum != this.current_round;
            }
            return true;
        },
        
        setBets: function(round_bets) {

            if(!this.betsValid(round_bets))
                return false;
                
                
            this.bets[this.current_round] = round_bets;
            return true;
        },
        
        
        scores: {
            /* same as bets */
        },
        
        scoresValid: function(round_scores) {
            var sum = _.reduce(round_scores, function(memo, num){ return memo + num; }, 0);
            
            return sum == this.current_round;
        },
        
        setScores: function(round_scores) {
        
            if(!this.scoresValid(round_scores))
                return false;
                        
            if(this.current_round > this.num_rounds)
                return false;
        
            this.scores[this.current_round] = round_scores;
            this.current_round++;
            return true;
        },
        
        wasLastRound: function() {
            return this.current_round > this.num_rounds;        
        },
        
        _calculateRoundPoints: function(bet, score) {
            if(bet == score) {
                return 2 + score;
            }
            else {
                return -1 * Math.abs(bet - score);
            }
        },
        
        calculatePoints: function() {
            var result = {};
            _.each(_.range(this.num_players),function(player){
                result[player] = 0;
            });
            
            var t = this;
        
            _.each(_.range(1, this.current_round), function(r) {
               
                _.each(_.range(t.num_players),function(p){
                    result[p] += t._calculateRoundPoints(t.bets[r][p], t.scores[r][p]);
                }); 
            });
            
            return result;
        }
    }
}
