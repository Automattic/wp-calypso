import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';

// from $wpnc__title-bar-height in boot/sizes.scss
const TITLE_OFFSET = 38;

/**
 * Says the notifications couldn't load, in the list's place, with a button that loads them again.
 */
export const LoadError = ( { height, isRetrying, onRetry, translate } ) => (
	<div className="wpnc__empty-notes-container" style={ { height: height - TITLE_OFFSET + 'px' } }>
		<div className="wpnc__empty-notes">
			<h2>{ translate( 'Notifications unavailable' ) }</h2>
			<p>{ translate( 'Something went wrong while loading them.' ) }</p>
			<p>
				<Button
					__next40pxDefaultSize
					variant="secondary"
					isBusy={ isRetrying }
					accessibleWhenDisabled
					disabled={ isRetrying }
					onClick={ onRetry }
				>
					{ translate( 'Try again' ) }
				</Button>
			</p>
		</div>
	</div>
);

export default localize( LoadError );
