/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import AnimatedPlaceholder from '../animated-placeholder';
import CreateAndRedirect from './create-and-redirect';
import { useNewQueryParam } from '../../path';
import './style.scss';
import {Icon} from "@wordpress/components";

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	const shouldTriggerCreate = useNewQueryParam();

	//const createAndRedirect = shouldTriggerCreate ? <CreateAndRedirect /> : null;

	return (
		<div className="create-site__background">
{/*
			{ createAndRedirect }
*/}
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>
				<div className="create-site__content">
					<div className="create-site__text">
						{ NO__( 'Building your site' ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;
