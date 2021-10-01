import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import JetpackLogo from 'calypso/components/jetpack-logo'; // @TODO: extract to @automattic package
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { usePath, Step } from '../../path';
import Link from '../link';
import type { FunctionComponent } from 'react';

import './style.scss';

const PlansButton: FunctionComponent = () => {
	const { __ } = useI18n();
	const makePath = usePath();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );

	// This hook is different from `getSelectedPlan` in the store.
	// This accounts for plans that may come from e.g. selecting a domain or adding a plan via URL
	const plan = useSelectedPlan();

	const planLabel = plan
		? /* translators: Button label where %s is the WordPress.com plan name (eg: Personal, Premium, Business) */
		  sprintf( __( '%s Plan' ), plan.title )
		: __( 'View plans' );

	return (
		<>
			<Link
				to={ makePath( Step.PlansModal ) }
				label={ planLabel }
				className={ classnames( 'plans-button', { 'is-highlighted': !! plan } ) }
				data-e2e-string={ plan ? '%s Plan' : 'View plans' }
				data-e2e-string-params={ plan && JSON.stringify( [ plan.title ] ) }
			>
				{ isDesktop && planLabel }
				<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
			</Link>
		</>
	);
};

export default PlansButton;
