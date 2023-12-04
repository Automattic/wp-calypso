# ReviewsRatingsStars

-   If `isInteractive`, stars change on hover, and rating is saved on click. (We'll need to hook this up to an API.)
    -   Once a rating has been saved, `onMouseLeave` won't revert the stars to empty – you can only change the
        rating to 1-5.
-   Otherwise,
    -   If there is a `rating` prop, bar shows the appropriate number of stars.
    -   Else all stars are blanked out.

## Usage

```php
// Medium size, read only, with average rating and rating count
WCCOM\component(
    'reviews-ratings-stars',
    array(
        'rating'        => 3,
        'averageRating' => 4.1,
        'ratingCount'   => 567,
    )
);

// Smaller size, read only, with average rating and rating count
WCCOM\component(
    'reviews-ratings-stars',
    array(
        'rating'        => 3,
        'averageRating' => 4.1,
        'size'          => 'medium-small',
        'ratingCount'   => 567,
    )
);

// Small size, interactive, with selected rating shown on click
WCCOM\component(
    'reviews-ratings-stars',
    array(
        'isInteractive'      => true,
        'size'               => 'medium-large',
        'showSelectedRating' => true,
    )
);
```

```jsx
<ReviewsRatingsStars rating={ 4 } averageRating={ 4.1 } ratingCount={ 567 } />
```
