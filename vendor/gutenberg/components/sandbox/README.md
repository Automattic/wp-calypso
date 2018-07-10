This component provides an isolated environment for arbitrary HTML via iframes. 

#### To test

Embed the following:

- Short tweet: https://twitter.com/notnownikki/status/876229494465581056
- Long tweet with media: https://twitter.com/PattyJenks/status/874034832430424065
- Video: https://www.youtube.com/watch?v=PfKUdmTq2MI
- Photo: https://cloudup.com/cQFlxqtY4ob
- Long tumblr post: http://doctorwho.tumblr.com/post/162052108791
- Create a custom html block with the following content: <img src="https://cldup.com/G3fFjtKEKe-3000x3000.jpeg">

This tests that HTML is written into the sandbox correctly in all cases, and that sites that do responsive resizes (e.g. tumblr) don't mess up when put into a small iframe that is also trying to resize.
