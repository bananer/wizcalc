
// TODO: could possibly be refactored for less duplicate code in bets/scores

game = function(num_players) {
    var num_cards = 60;
    
    /**
     * Private methods
     */    
    var calculateRoundPoints = function(bet, score) {
        if(bet == score) {
            return 2 + score;
        }
        else {
            return -1 * Math.abs(bet - score);
        }
    }

    
    /**
     * Public stuff
     */
    return {
        num_players: num_players,
        num_rounds: num_cards/num_players,
        
        current_round: 1, // == number of cards dealt
        
        bets: {
          /* {
           *   <round>: { <player_id> : <bet>, ... },
           *   ...
           * }
           */
            
        },
        
        /**
         * Checks if a set of bets is valid for the
         * current game state
         * @ return bool
         */
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
        
        /**
         * saves the bets as the next set
         * @ return bool
         */
        setBets: function(round_bets) {

            if(!this.betsValid(round_bets))
                return false;
                
            this.bets[this.current_round] = round_bets;
            return true;
        },
        
        
        scores: {
            /* same as bets */
        },
        
        
        /**
         * Checks if a set of scores is valid for the
         * current game state
         * @ return bool
         */
        scoresValid: function(round_scores) {
            var sum = _.reduce(round_scores, function(memo, num){ return memo + num; }, 0);
            
            return sum == this.current_round;
        },
        
        /**
         * saves the scores as the next set
         * @return bool
         */
        setScores: function(round_scores) {
        
            if(!this.scoresValid(round_scores))
                return false;
                        
            if(this.current_round > this.num_rounds)
                return false;
        
            this.scores[this.current_round] = round_scores;
            this.current_round++;
            return true;
        },
        
        /**
         * returns true if the game has ended
         */ 
        wasLastRound: function() {
            return this.current_round > this.num_rounds;        
        },
        
        /**
         * calculates the current game's scores for each player
         * @return { <player_id>: <score>, … }
         */
        calculatePoints: function() {
            var result = {};
            _.each(_.range(this.num_players),function(player){
                result[player] = 0;
            });
            
            var t = this;
        
            _.each(_.range(1, this.current_round), function(r) {
               
                _.each(_.range(t.num_players),function(p){
                    result[p] += t.calculateRoundPoints(t.bets[r][p], t.scores[r][p]);
                }); 
            });
            
            return result;
        }
    }
}
