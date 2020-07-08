/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __experimentalBlock as Block } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Context from './context';
import Controls from './controls';
import Tab from './tab';
import StripeNudge from './stripe-nudge';

const Tabs = ( props ) => {
	const { attributes, products, setAttributes, stripeConnectUrl } = props;
	const { oneTimePlanId, monthlyPlanId, annuallyPlanId } = attributes;
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isTabActive = ( tab ) => activeTab === tab;

	const tabs = {
		'one-time': { title: __( 'One-Time', 'full-site-editing' ) },
		...( monthlyPlanId && { '1 month': { title: __( 'Monthly', 'full-site-editing' ) } } ),
		...( annuallyPlanId && { '1 year': { title: __( 'Yearly', 'full-site-editing' ) } } ),
	};

	// Sets the plans when the block is inserted.
	useEffect( () => {
		// Since there is no setting for disabling the one-time option, we can assume that the block has been just
		// inserted if the attribute `oneTimePlanId` is not set.
		if ( ! oneTimePlanId ) {
			setAttributes( {
				oneTimePlanId: products[ 'one-time' ],
				monthlyPlanId: products[ '1 month' ],
				annuallyPlanId: products[ '1 year' ],
			} );
		}
	}, [ oneTimePlanId ] );

	// Activates the one-time tab if the interval of the current active tab is disabled.
	useEffect( () => {
		if ( ! monthlyPlanId && isTabActive( '1 month' ) ) {
			setActiveTab( 'one-time' );
		}

		if ( ! annuallyPlanId && isTabActive( '1 year' ) ) {
			setActiveTab( 'one-time' );
		}
	}, [ monthlyPlanId, annuallyPlanId ] );

	return (
		<Block.div>
			{ stripeConnectUrl && <StripeNudge stripeConnectUrl={ stripeConnectUrl } /> }
			<div className="donations__container">
				{ Object.keys( tabs ).length > 1 && (
					<div className="donations__tabs">
						{ Object.entries( tabs ).map( ( [ interval, { title } ] ) => (
							<Button
								className={ classNames( { 'is-active': isTabActive( interval ) } ) }
								onClick={ () => setActiveTab( interval ) }
							>
								{ title }
							</Button>
						) ) }
					</div>
				) }
				<div className="donations__content">
					<Context.Provider value={ { activeTab } }>
						{ Object.keys( tabs ).map( ( interval ) => (
							<Tab { ...props } interval={ interval } />
						) ) }
					</Context.Provider>
				</div>
			</div>
			<Controls { ...props } />
		</Block.div>
	);
};

export default Tabs;
