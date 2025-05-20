class Stack {
    constructor() {
        this.items = [];
        this.maxSize = 20; // Limit history items
    }

    push(element) {
        if (this.items.length >= this.maxSize) {
            this.items.shift(); // Remove oldest item if stack is full
        }
        this.items.push(element);
    }

    pop() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }

    toArray() {
        return [...this.items].reverse(); // Return in chronological order
    }
}

class VisitedStack extends Stack {
    constructor() {
        super();
        this.maxSize = 10; // Fewer visited articles than search history
    }
}

const historyStack = new Stack();
const visitedStack = new VisitedStack();
