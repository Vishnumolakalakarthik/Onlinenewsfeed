class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    search(word) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.isEndOfWord;
    }

    startsWith(prefix) {
        let node = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return true;
    }

    // Extract keywords from text
    extractKeywords(text) {
        const words = text.toLowerCase().split(/\s+/);
        const keywords = [];
        
        for (const word of words) {
            // Remove punctuation and check if word exists in trie
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord.length > 0 && this.search(cleanWord)) {
                keywords.push(cleanWord);
            }
        }
        
        return keywords;
    }
}

// Initialize with some common keywords
const newsTrie = new Trie();
const commonKeywords = [
    'sports', 'football', 'basketball', 'cricket', 'tennis',
    'technology', 'apple', 'google', 'microsoft', 'ai',
    'business', 'stocks', 'economy', 'market',
    'health', 'medicine', 'fitness', 'nutrition','pawankalyan',
    'politics', 'election', 'government', 'world'
];

commonKeywords.forEach(word => newsTrie.insert(word));