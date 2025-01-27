import { isWpMobileApp } from 'calypso/lib/mobile-app';
let lastScrollPosition = 0; // Used for calculating scroll direction.
let sidebarTop = 0; // Current sidebar top position.
let pinnedSidebarTop = true; // We pin sidebar to the top by default.
let pinnedSidebarBottom = false;
let ticking = false; // Used for Scroll event throttling.

export function shouldLoadInlineHelp( sectionName: string, currentRoute: string ) {
	if ( isWpMobileApp() ) {
		return false;
	}

	const exemptedSections = [ 'jetpack-connect', 'devdocs', 'help', 'home' ];
	const exemptedRoutes = [ '/log-in/jetpack' ];
	const exemptedRoutesStartingWith = [
		'/start/p2',
		'/start/setup-site',
		'/start/newsletter',
		'/plugins/domain',
		'/plugins/marketplace/setup',
	];

	return (
		! exemptedSections.includes( sectionName ) &&
		! exemptedRoutes.includes( currentRoute ) &&
		! exemptedRoutesStartingWith.some( ( startsWithString ) =>
			currentRoute.startsWith( startsWithString )
		)
	);
}

export const handleScroll = ( event: React.UIEvent< HTMLElement > ): void => {
	// Do not run until next requestAnimationFrame or if running out of browser context.
	if ( ticking ) {
		return;
	}

	const windowHeight = window.innerHeight;
	const contentEl = document.getElementById( 'content' );
	const contentHeight = contentEl?.scrollHeight;
	const secondaryEl = document.getElementById( 'secondary' ); // Or referred as sidebar.
	const secondaryElHeight = secondaryEl?.scrollHeight;
	const masterbarHeight = document.getElementById( 'header' )?.getBoundingClientRect().height;

	// Check whether we need to adjust content height so that scroll events are triggered.
	// Sidebar has overflow: initial and position:fixed, so content is our only chance for scroll events.
	if ( contentEl && contentHeight && masterbarHeight && secondaryElHeight ) {
		if ( contentHeight < secondaryElHeight ) {
			// Adjust the content height so that it matches the sidebar + masterbar vertical scroll estate.
			contentEl.style.minHeight = secondaryElHeight + masterbarHeight + 'px';
		}

		if (
			windowHeight >= secondaryElHeight + masterbarHeight &&
			contentEl &&
			secondaryEl &&
			( contentEl.style.minHeight !== 'initial' || secondaryEl.style.position )
		) {
			// In case that window is taller than the sidebar we reinstate the content min-height. CSS code: client/layout/style.scss:30.
			contentEl.style.minHeight = 'initial';
			// In case that window is taller than the sidebar after resize we need to clean up any previously set inline styles
			secondaryEl.removeAttribute( 'style' );
		}
	}

	if (
		secondaryEl &&
		secondaryElHeight !== undefined &&
		masterbarHeight !== undefined &&
		( secondaryElHeight + masterbarHeight > windowHeight || 'resize' === event.type ) // Only run when sidebar & masterbar are taller than window height OR we have a resize event
	) {
		// Throttle scroll event
		window.requestAnimationFrame( function () {
			const maxScroll = secondaryElHeight + masterbarHeight - windowHeight; // Max sidebar inner scroll.
			const scrollY = -document.body.getBoundingClientRect().top; // Get current scroll position.

			// Check for overscrolling, this happens when swiping up at the top of the document in modern browsers.
			if ( scrollY < 0 ) {
				// Stick the sidebar to the top.
				if ( ! pinnedSidebarTop ) {
					pinnedSidebarTop = true;
					pinnedSidebarBottom = false;
					secondaryEl.style.position = 'fixed';
					secondaryEl.style.top = '0';
					secondaryEl.style.bottom = '0';
				}

				ticking = false;
				return;
			} else if ( scrollY + windowHeight > document.body.scrollHeight - 1 ) {
				// When overscrolling at the bottom, stick the sidebar to the bottom.
				if ( ! pinnedSidebarBottom ) {
					pinnedSidebarBottom = true;
					pinnedSidebarTop = false;

					secondaryEl.style.position = 'fixed';
					secondaryEl.style.top = 'inherit';
					secondaryEl.style.bottom = '0';
				}

				ticking = false;
				return;
			}

			if ( scrollY >= lastScrollPosition ) {
				// When a down scroll has been detected.

				if ( pinnedSidebarTop ) {
					pinnedSidebarTop = false;
					sidebarTop = masterbarHeight;

					if ( scrollY > maxScroll ) {
						//In case we have already passed the available scroll of the sidebar, add the current scroll
						sidebarTop += scrollY;
					}

					secondaryEl.style.position = 'absolute';
					secondaryEl.style.top = `${ sidebarTop }px`;
					secondaryEl.style.bottom = 'inherit';
				} else if (
					! pinnedSidebarBottom &&
					scrollY + masterbarHeight > maxScroll + secondaryEl.offsetTop
				) {
					// Pin it to the bottom.
					pinnedSidebarBottom = true;

					secondaryEl.style.position = 'fixed';
					secondaryEl.style.top = 'inherit';
					secondaryEl.style.bottom = '0';
				}
			} else if ( scrollY < lastScrollPosition ) {
				// When a scroll up is detected.

				// If it was pinned to the bottom, unpin and calculate relative scroll.
				if ( pinnedSidebarBottom ) {
					pinnedSidebarBottom = false;

					// Calculate new offset position.
					sidebarTop = Math.max( 0, scrollY + masterbarHeight - maxScroll );
					if ( contentHeight === secondaryElHeight + masterbarHeight ) {
						// When content is originally shorter than the sidebar and
						// we have already made it equal to the sidebar + masterbar
						// the offset will always be the masterbar height (top position).
						sidebarTop = masterbarHeight;
					}

					secondaryEl.style.position = 'absolute';
					secondaryEl.style.top = `${ sidebarTop }px`;
					secondaryEl.style.bottom = 'inherit';
				} else if ( ! pinnedSidebarTop && scrollY + masterbarHeight < sidebarTop ) {
					// Pin it to the top.
					pinnedSidebarTop = true;
					sidebarTop = masterbarHeight;

					secondaryEl.style.position = 'fixed';
					secondaryEl.style.top = `${ sidebarTop }px`;
					secondaryEl.style.bottom = 'inherit';
				}
			}

			lastScrollPosition = scrollY;

			ticking = false;
		} );
		ticking = true;
	}
};
