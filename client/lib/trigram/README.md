# Trigram

Trigram is a module for measuring the similarity between two strings.

Example usage:

```js
import { cosineSimilarity } from 'calypso/lib/trigram';

// 2 strings that are exactly the same have cosine similarity =~ 1
cosineSimilarity( 'Hello', 'Hello' ) > 0.99 && cosineSimilarity( 'Hello', 'Hello' ) < 1.01;

// 2 strings with no overlapping trigrams have cosine similarity =~ 0
cosineSimilarity( 'abcab', 'xyzyz' ) > -0.01 && cosineSimilarity( 'abcab', 'xyzyz' ) < 0.01;

// 2 strings that are somewhat similar have a cosine similarity of a real
// number between 0 and 1, indicating how similar they are
cosineSimilarity( 'There', 'Their' ) > 0.39 && cosineSimilarity( 'There', 'Their' ) < 0.41;
```
