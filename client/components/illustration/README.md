Illustration
===========================

The Illustration component displays an illustration from `/assets/images/illustrations/`

## Usage

```js
import Illustration from 'components/illustration';

<Illustration path="my-illustration.svg" width="400" alt="My illustration" />
```

## Props

| Name | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `path` | string | | Path to the image file; everything after `/assets/images/illustrations` |
| `width` | int | `200` | Width of the image |
| `height` | int | | Height of the image |
| `alt` | string | `''` | Alt text |