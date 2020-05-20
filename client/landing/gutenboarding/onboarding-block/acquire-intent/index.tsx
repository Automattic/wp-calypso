/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useSelect } from '@wordpress/data';
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

/**
 * Style dependencies
 */
import './style.scss';

const AcquireIntent: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { getSelectedSiteTitle } = useSelect( ( select ) => select( STORE_KEY ) );

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

	// translators: Button label for advancing to Design Picker step in onboarding
	const nextLabel = __( 'Choose design' );

	return (
		<div className="gutenboarding-page acquire-intent">
			<SiteTitle onSubmit={ handleSiteTitleSubmit } skippable={ ! hasSiteTitle } />
			<div
				className={ classnames( 'acquire-intent__footer', {
					'acquire-intent__footer--hidden': ! hasSiteTitle,
				} ) }
			>
				<Link className="acquire-intent__question-skip" isPrimary to={ nextStepPath }>
					{ nextLabel }
				</Link>
			</div>
		</div>
	);
};

export default AcquireIntent;
