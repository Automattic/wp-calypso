# Trigram

Trigram is a module for measuring the similarity between two strings.

Example usage:

```js
import { cosineSimilarity } from 'calypso/lib/trigram';
cosineSimilarity( "Hello", "Hello" ) == 1.00  // Approximately, not exactly; floating point
cosineSimilarity( "abcab", "xyzxy" ) == 0.00  // Approximately
cosineSimilarity( "There", "Their" ) == 0.40  // Approximately
```
