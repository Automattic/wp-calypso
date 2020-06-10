/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'; // @TODO: extract to @automattic package
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { usePath, Step } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

const PlansButton: React.FunctionComponent< Button.ButtonProps > = ( { ...buttonProps } ) => {
	const { __ } = useI18n();
	const history = useHistory();
	const makePath = usePath();

	// mobile first to match SCSS media query https://github.com/Automattic/wp-calypso/pull/41471#discussion_r415678275
	const isDesktop = useViewportMatch( 'mobile', '>=' );

	const handleButtonClick = () =>
		history.push( makePath( Step.Plans ), {
			fromPlansButton: true,
		} );

	// This hook is different from `getSelectedPlan` in the store.
	// This accounts for plans that may come from e.g. selecting a domain or adding a plan via URL
	const plan = useSelectedPlan();

	const planLabel = plan
		? /* translators: Button label where %s is the WordPress.com plan name (eg: Personal, Premium, Business) */
		  sprintf( __( '%s Plan' ), plan.title )
		: __( 'View plans' );

	return (
		<>
			<Button
				onClick={ handleButtonClick }
				label={ __( planLabel ) }
				className={ classnames( 'plans-button', { 'is-highlighted': !! plan } ) }
				{ ...buttonProps }
			>
				{ isDesktop && planLabel }
				<JetpackLogo className="plans-button__jetpack-logo" size={ 16 } monochrome />
			</Button>
		</>
	);
};

export default PlansButton;
