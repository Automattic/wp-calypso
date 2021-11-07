# Images

Images from this folder are managed by webpack, and can be imported like this:

```javascript
import mediaPostImageURL from 'assets/images/upgrades/media-post.svg';
```

You can then use such image that way:

```javascript
<img src={ mediaPostImageURL } alt="Illustration" />;
```

Technically speaking, webpack will copy that image to the `public/images` output folder automatically, with an immutable hashed name (so this name will change if the source image changes).
