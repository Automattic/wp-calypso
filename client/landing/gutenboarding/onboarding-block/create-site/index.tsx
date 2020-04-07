/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import CreateAndRedirect from './create-and-redirect';
import { useNewQueryParam } from '../../path';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();
	const [ shouldCreateAndRedirect, setCreateAndRedirect ] = React.useState( false );

	// Some very rudimentary progress illusions

	const progressSteps = [
		NO__( 'Building your site' ),
		NO__( 'Getting your domain' ),
		NO__( 'Applying design' ),
	];

	return (
		<div className="create-site__background">
			{ shouldTriggerCreate && shouldCreateAndRedirect && <CreateAndRedirect /> }
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="create-site__content">
					<div className="create-site__progress">
						<div className="create-site__progress-steps">
							{ progressSteps.map( step => (
								<div key={ step } className="create-site__progress-step">
									{ step }
								</div>
							) ) }
						</div>
					</div>
					<div
						className="create-site__progress-bar"
						onAnimationEnd={ () => setCreateAndRedirect( true ) }
					/>
					<div className="create-site__progress-numbered-steps">
						{ progressSteps.map( ( _, index ) => (
							<p>{ `Step ${ index + 1 } of ${ progressSteps.length }` }</p>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;
