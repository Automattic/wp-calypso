# Trigram

Trigram is a module for measuring the similarity between two strings.

Example usage:

```js
import { cosine_similarity } from 'calypso/lib/trigram';
cosine_similarity( "Hello", "Hello" ) == 1.00  // Approximately, not exactly; floating point
cosine_similarity( "abcab", "xyzxy" ) == 0.00  // Approximately
cosine_similarity( "There", "Their" ) == 0.40  // Approximately
```
