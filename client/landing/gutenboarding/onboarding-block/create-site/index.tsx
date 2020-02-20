/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: FunctionComponent< {} > = () => {
	const { __: NO__ } = useI18n();
	return (
		<div className="create-site__background">
			<div className="create-site__layout">
				<div className="create-site__header">
					<div className="create-site__toolbar">
						<div className="create-site__placeholder create-site__placeholder-site">
							Placeholder
						</div>
					</div>
					<div className="create-site__settings">
						<div className="create-site__placeholder create-site__placeholder-button">
							Placeholder
						</div>
						<div className="create-site__placeholder create-site__placeholder-button">
							Placeholder
						</div>
						<div className="create-site__placeholder create-site__placeholder-button">
							Placeholder
						</div>
					</div>
				</div>
				<div className="create-site__content">
					<div className="create-site__placeholder create-site__placeholder-title">Placeholder</div>
					<div className="create-site__text">{ NO__( 'Your site is being created...' ) }</div>
				</div>
			</div>
		</div>
	);
};

export default CreateSite;
