/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useSelect, useDispatch } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import Link from '../../components/link';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import Arrow from './arrow';
import { useTrackStep } from '../../hooks/use-track-step';

/**
 * Style dependencies
 */
import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { siteVertical, siteTitle, wasVerticalSkipped } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { skipSiteVertical } = useDispatch( STORE_KEY );
	const makePath = usePath();

	const [ isSiteTitleActive, setIsSiteTitleActive ] = React.useState( false );

	const isMobile = useViewportMatch( 'small', '<' );

	const handleSkip = () => {
		skipSiteVertical();
		setIsSiteTitleActive( true );
	};

	useTrackStep( 'IntentGathering' );

	const siteTitleComponent = (
		<SiteTitle
			isVisible={ !! ( siteVertical || siteTitle || wasVerticalSkipped ) }
			isMobile={ isMobile }
		/>
	);
	const verticalSelectComponent = <VerticalSelect onNext={ () => setIsSiteTitleActive( true ) } />;

	// translators: Button label for skipping filling an optional input in onboarding
	const skipLabel = __( 'I donʼt know' );

	return (
		<div
			className={ classnames( 'gutenboarding-page acquire-intent', {
				'acquire-intent--mobile-vertical-step': ! isSiteTitleActive && isMobile,
			} ) }
		>
			{ isMobile &&
				( isSiteTitleActive ? (
					<>
						<Arrow
							className="acquire-intent__mobile-back-arrow"
							onClick={ () => setIsSiteTitleActive( false ) }
						/>
						{ siteTitleComponent }
					</>
				) : (
					verticalSelectComponent
				) ) }
			{ ! isMobile && (
				<>
					{ verticalSelectComponent }
					{ siteTitleComponent }
				</>
			) }
			<div className="acquire-intent__footer">
				{ siteVertical || wasVerticalSkipped ? (
					( ! isMobile || isSiteTitleActive ) && (
						<Link
							className="acquire-intent__question-skip"
							isPrimary
							to={ makePath( Step.DesignSelection ) }
						>
							{ siteTitle ? __( 'Choose a design' ) : skipLabel }
						</Link>
					)
				) : (
					<Button isLink onClick={ handleSkip } className="acquire-intent__skip-vertical">
						{ skipLabel }
					</Button>
				) }
			</div>
		</div>
	);
};

export default AcquireIntent;
