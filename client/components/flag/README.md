Flag
====

## Usage

```js
import Flag from 'components/flag';

<Flag type="is-success" icon="noticon-lock">This is a flag</Flag>

```

## Required props

* `type` – String that determines which type of flag is displayed. Currently accepts:
    * is-success
    * is-warning
    * is-error

## Optional props

* `icon` - Noticon icon class name. Examples:
    * noticon-warning
    * noticon-lock
    * noticon-checkmark
    * ...
    
* `className` - Class name. Currently accepts:
    * is-success
    * is-warning
    * is-error
