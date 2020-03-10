export default `
<!-- wp:heading -->
<h2>Previewing a testing layout</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This layout is being previewed by the EditorLayoutPreview plugin. The content of this block is defined in a <code>testing-layout.js</code>, into the plugin folder.</p>
<!-- /wp:paragraph -->

<!-- wp:coblocks/accordion -->
<div class="wp-block-coblocks-accordion"><!-- wp:coblocks/accordion-item {"title":"This is a CoBlock Accordion"} -->
<div class="wp-block-coblocks-accordion-item"><details><summary class="wp-block-coblocks-accordion-item__title">This is a CoBlock Accordion</summary><div class="wp-block-coblocks-accordion-item__content"><!-- wp:paragraph {"placeholder":"Add content…"} -->
<p>Hi, There!</p>
<!-- /wp:paragraph --></div></details></div>
<!-- /wp:coblocks/accordion-item --></div>
<!-- /wp:coblocks/accordion -->

<!-- wp:jetpack/timeline -->
<ul class="wp-block-jetpack-timeline"><!-- wp:jetpack/timeline-item -->
<li style="background-color:#eeeeee" class="wp-block-jetpack-timeline-item"><div class="timeline-item"><div class="timeline-item__bubble" style="border-color:#eeeeee"></div><div class="timeline-item__dot" style="background-color:#eeeeee"></div><!-- wp:heading -->
<h2>Jetpack/Timeline</h2>
<!-- /wp:heading --></div></li>
<!-- /wp:jetpack/timeline-item -->

<!-- wp:jetpack/timeline-item -->
<li style="background-color:#eeeeee" class="wp-block-jetpack-timeline-item"><div class="timeline-item"><div class="timeline-item__bubble" style="border-color:#eeeeee"></div><div class="timeline-item__dot" style="background-color:#eeeeee"></div><!-- wp:heading {"level":4} -->
<h4>H4</h4>
<!-- /wp:heading --></div></li>
<!-- /wp:jetpack/timeline-item --></ul>
<!-- /wp:jetpack/timeline -->

<!-- wp:jetpack/event-countdown {"eventDate":"2020-09-21T18:47:00"} -->
<div class="wp-block-jetpack-event-countdown"><div class="event-countdown__date">2020-09-21T18:47:00</div><div class="event-countdown__counter"><p><strong class="event-countdown__day">&nbsp;</strong> days</p><p><span><strong class="event-countdown__hour">&nbsp;</strong> hours</span><span><strong class="event-countdown__minute">&nbsp;</strong> minutes</span><span><strong class="event-countdown__second">&nbsp;</strong> seconds</span></p><p>until</p></div><div class="event-countdown__event-title"><p>GM 2020</p></div></div>
<!-- /wp:jetpack/event-countdown -->

<!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph -->
`;
