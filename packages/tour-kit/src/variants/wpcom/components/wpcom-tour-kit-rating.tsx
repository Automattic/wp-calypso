import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { useTourKitContext } from '../../../index';
import thumbsDown from '../icons/thumbs_down';
import thumbsUp from '../icons/thumbs_up';
import type { WpcomConfig } from '../../../index';

const WpcomTourKitRating: React.FunctionComponent = () => {
	const [ tempRating, setTempRating ] = useState< 'thumbs-up' | 'thumbs-down' >();
	const context = useTourKitContext();
	const config = ( context.config as unknown ) as WpcomConfig;
	const tourRating = config.options?.tourRating?.useTourRating?.() ?? tempRating;

	let isDisabled = false;

	if ( ! config.options?.tourRating?.enabled ) {
		return null;
	}

	// check is on tempRating to allow rerating in a restarted tour
	if ( ! isDisabled && tempRating !== undefined ) {
		isDisabled = true;
	}

	const rateTour = ( isThumbsUp: boolean ) => {
		if ( isDisabled ) {
			return;
		}

		const rating = isThumbsUp ? 'thumbs-up' : 'thumbs-down';

		if ( rating !== tourRating ) {
			isDisabled = true;
			setTempRating( rating );
			config.options?.tourRating?.onTourRate?.( rating );
		}
	};

	return (
		<>
			<p className="wpcom-tour-kit-rating__end-text">
				{ __( 'Did you find this guide helpful?', 'full-site-editing' ) }
			</p>
			<div>
				<Button
					aria-label={ __( 'Rate thumbs up', 'full-site-editing' ) }
					className={ classNames( 'wpcom-tour-kit-rating__end-icon', {
						active: tourRating === 'thumbs-up',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsUp }
					onClick={ () => rateTour( true ) }
					iconSize={ 24 }
				/>
				<Button
					aria-label={ __( 'Rate thumbs down', 'full-site-editing' ) }
					className={ classNames( 'wpcom-tour-kit-rating__end-icon', {
						active: tourRating === 'thumbs-down',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsDown }
					onClick={ () => rateTour( false ) }
					iconSize={ 24 }
				/>
			</div>
		</>
	);
};

export default WpcomTourKitRating;
