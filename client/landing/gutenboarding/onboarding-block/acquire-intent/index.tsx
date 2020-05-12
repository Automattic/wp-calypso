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
	const {
		getSelectedVertical,
		getSelectedVerticalUntranslatedLabel,
		getSelectedSiteTitle,
		wasVerticalSkipped,
	} = useSelect( ( select ) => select( STORE_KEY ) );

	const { skipSiteVertical } = useDispatch( STORE_KEY );

	const makePath = usePath();

	const [ isSiteTitleActive, setIsSiteTitleActive ] = React.useState( false );

	const isMobile = useViewportMatch( 'small', '<' );

	const handleSkip = () => {
		skipSiteVertical();
		setIsSiteTitleActive( true );
	};

	useTrackStep( 'IntentGathering', () => ( {
		selected_vertical: getSelectedVerticalUntranslatedLabel(),
		selected_site_title: getSelectedSiteTitle(),
	} ) );

	const showSiteTitleAndNext = !! (
		getSelectedVertical() ||
		getSelectedSiteTitle() ||
		wasVerticalSkipped()
	);
	// translators: Button label for skipping filling an optional input in onboarding
	const skipLabel = __( 'I donʼt know' );

	// declare UI elements here to avoid duplication when returning for mobile/desktop layouts
	const siteTitleInput = <SiteTitle isVisible={ showSiteTitleAndNext } isMobile={ isMobile } />;
	const verticalSelect = <VerticalSelect onNext={ () => setIsSiteTitleActive( true ) } />;
	const nextStepButton = (
		<Link
			className="acquire-intent__question-skip"
			isPrimary
			to={ makePath( Step.DesignSelection ) }
		>
			{ getSelectedSiteTitle() ? __( 'Choose a design' ) : skipLabel }
		</Link>
	);
	const skipButton = (
		<Button isLink onClick={ handleSkip } className="acquire-intent__skip-vertical">
			{ skipLabel }
		</Button>
	);

	const siteVertical = getSelectedVertical();

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
						{ siteTitleInput }
					</>
				) : (
					verticalSelect
				) ) }
			{ ! isMobile && (
				<>
					{ verticalSelect }
					{ siteTitleInput }
				</>
			) }
			<div className="acquire-intent__footer">
				{ /* On mobile we render skipButton on vertical step when there is no vertical with more than 2 characters selected which is the
				case when we render the Next arrow button next to the input. On site title step we always render nextStepButton */ }
				{ isMobile &&
					( isSiteTitleActive
						? nextStepButton
						: ( ! siteVertical || siteVertical?.label?.length < 3 ) && skipButton ) }

				{ /* On desktop we always render nextStepButton when we render site title
				Otherwise we render skipButton  */ }
				{ ! isMobile && ( showSiteTitleAndNext ? nextStepButton : skipButton ) }
			</div>
		</div>
	);
};

export default AcquireIntent;
