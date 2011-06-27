/**
 * A trie dictionary storage model
 *
 * @author     James Brumond
 * @version    0.2.1
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 */

// The index used to store word matches
var FLAG_INDEX = '^';

/**
 * The trie constructor
 */
var Trie = function() {
	var self = this;
	
	/**
	 * The data storage object
	 */
	var dictionary = { };
	
// ----------------------------------------------------------------------------
//  Public Methods
	
	/**
	 * Check if a word is a valid prefix in the dictionary
	 */
	self.isValidPrefix = function(word) {
		if (typeof word !== 'string' || ! word.length) {return false;}
		var current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			if (! current[word[i]]) {return false;}
			current = current[word[i]];
		}
		return containsWords(current);
	};
	
	/**
	 * Check if a word exists in the dictionary
	 */
	self.lookup = function(word) {
		if (typeof word !== 'string' || ! word.length) {return false;}
		var current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			if (! current[word[i]]) {return false;}
			current = current[word[i]];
		}
		return (current[FLAG_INDEX] === 1);
	};
	
	/**
	 * Add a word to the dictionary
	 */
	self.addWord = function(word) {
		if (typeof word !== 'string' || ! word.length) {return false;}
		var current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			if (! current[word[i]]) {
				current[word[i]] = { };
			}
			current = current[word[i]];
		}
		current[FLAG_INDEX] = 1;
	};
	
	/**
	 * Remove a word from the dictionary
	 */
	self.removeWord = function(word) {
		if (typeof word !== 'string' || ! word.length) {return false;}
		var current = dictionary;
		for (var i = 0, c = word.length; i < c; i++) {
			if (! current[word[i]]) {return true;}
			current = current[word[i]];
		}
		current[FLAG_INDEX] = 0;
		cleanupBranch(dictionary, word);
	};
	
	/**
	 * Get a string representation of the trie structure
	 */
	self.dumpJson = function() {
		return JSON.stringify(dictionary);
	};
	
	/**
	 * Import a JSON trie structure and set the dictionary
	 */
	self.loadJson = function(json) {
		dictionary = JSON.parse(json);
	};
	
	/**
	 * Builds an array of all words in the trie
	 */
	self.getWords = function() {
		return getWords(dictionary);
	};
	
};
	
// ----------------------------------------------------------------------------
//  Helper Functions

function containsWords(dictionary) {
	if (dictionary[FLAG_INDEX] === 1) {return true;}
	for (var i in dictionary) {
		if (dictionary.hasOwnProperty(i) && i !== FLAG_INDEX) {
			if (containsWords(dictionary[i])) {return true;}
		}
	}
	return false;
};

function cleanupBranch(dictionary, word) {
	var i, c, ch, levels = [ dictionary ];
	for (i = 0, c = word.length; i < c; i++) {
		ch = word[i];
		if (! levels[0][ch]) {break;}
		levels.unshift(levels[0][ch]);
	}
	for (i = 0, c = levels.length; i < c; i++) {
		if (containsWords(levels[i])) {break;}
		levels[i] = null;
		if (levels[i + 1]) {
			ch = word[word.length - (i + 1)];
			delete levels[i + 1][ch];
		}
	}
};

function getWords(dictionary, prefix) {
	var words = [ ];
	prefix = prefix || '';
	if (dictionary[FLAG_INDEX] === 1) {
		words.push(prefix);
	}
	for (var i in dictionary) {
		if (dictionary.hasOwnProperty(i) && i !== FLAG_INDEX) {
			words = words.concat(getWords(dictionary[i], prefix + i));
		}
	}
	return words;
};

// ----------------------------------------------------------------------------
//  Expose

module.exports.Trie = Trie;
module.exports.createTrieFromArray = function(words) {
	var ret = new Trie();
	for (var i = 0, c = words.length; i < c; i++) {
		ret.addWord(words[i]);
	}
	return ret;
};
module.exports.createTrieFromJson = function(json) {
	var ret = new Trie();
	ret.loadJson(json);
	return ret;
};

/* End of file trie.js */
