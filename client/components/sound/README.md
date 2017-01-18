Sound Player
============

This component preloads audio and plays it under different conditions, depending on the props passed.

### Props

 - `src`: (*string*) - The audio file to load
 - `playOnMount`: (*boolean*) - The sound will be played once as soon as the component is mounted
 - `trigger`: (*any*) - The sound will be played each time the value of this prop is changed (the
   sound will not be played when the component mounts unless `playOnMount` is `true`).
   A `===` equality check is used.
