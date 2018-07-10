# Blocks

The purpose of this tutorial is to step through the fundamentals of creating a new block type. Beginning with the simplest possible example, each new section will incrementally build upon the last to include more of the common functionality you could expect to need when implementing your own block types.

To follow along with this tutorial, you can [download the accompanying WordPress plugin](https://github.com/WordPress/gutenberg-examples) which includes all of the examples for you to try on your own site. At each step along the way, you should feel free to experiment by modifying the examples with your own ideas and observing the effects they have on the block's behavior.

Code snippets are provided both for "classic" JavaScript (ECMAScript 5, or "ES5"), as well as newer versions of the language standard (ES2015 and newer, or "ESNext"). You can change between them using tabs found above each code example. When choosing to author your blocks with ESNext, you will need a build step in order to support older browsers. Note that it is not required to use ESNext to create a new block, and you are welcome to use classic JavaScript if you so choose.
