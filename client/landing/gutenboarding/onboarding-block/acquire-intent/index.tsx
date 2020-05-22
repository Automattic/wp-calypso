/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import Link from '../../components/link';
import SiteTitle from './site-title';
import { useTrackStep } from '../../hooks/use-track-step';
import { preloadDesignThumbs } from '../../available-designs';
import { recordSiteTitleSkip } from '../../lib/analytics';

/**
 * Style dependencies
 */
import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { getSelectedSiteTitle } = useSelect( ( select ) => select( STORE_KEY ) );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const history = useHistory();
	const makePath = usePath();
	const nextStepPath = makePath( Step.DesignSelection );

	useTrackStep( 'IntentGathering', () => ( {
		has_selected_site_title: !! getSelectedSiteTitle(),
	} ) );

	const hasSiteTitle = getSelectedSiteTitle()?.trim().length > 2;

	React.useEffect( preloadDesignThumbs, [] );

	const handleSiteTitleSubmit = () => {
		history.push( nextStepPath );
	};

	const handleSkip = () => {
		setSiteTitle( '' ); // reset site title if there is no valid entry
		recordSiteTitleSkip();
		handleSiteTitleSubmit();
	};

	// translators: Button label for advancing to Design Picker step in onboarding
	const nextLabel = __( 'Choose design' );

	// translators: Button label for skipping filling an optional input in onboarding
	const skipLabel = __( 'Skip for now' );

	const skipButton = (
		<Button isLink onClick={ handleSkip } className="acquire-intent__skip-site-title">
			{ skipLabel }
		</Button>
	);

	return (
		<div
			className={ classnames( 'gutenboarding-page acquire-intent', {
				'acquire-intent--with-skip': ! hasSiteTitle,
			} ) }
		>
			<SiteTitle skipButton={ skipButton } onSubmit={ handleSiteTitleSubmit } />
			<div className="acquire-intent__footer">
				{ skipButton }
				<Link className="acquire-intent__next" isPrimary to={ nextStepPath }>
					{ nextLabel }
				</Link>
			</div>
		</div>
	);
};

export default AcquireIntent;
