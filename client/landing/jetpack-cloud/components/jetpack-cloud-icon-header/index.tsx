/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	gridicon?: string;
	gridiconType?: 'normal' | 'warning' | 'error';
	imgAlt?: string;
	imgPath?: string;
}

const JetpackCloudIconHeader: FunctionComponent< Props > = ( {
	gridicon,
	gridiconType,
	imgAlt,
	imgPath,
} ) => {
	const getGridIconExtraClass = () => {
		switch ( gridiconType ) {
			case 'error':
				return 'is-error';
			case 'warning':
				return 'warning';
			case 'normal':
			default:
				return undefined;
		}
	};

	return (
		<div className="jetpack-cloud-icon-header">
			{ gridicon && <Gridicon className={ getGridIconExtraClass() } icon={ gridicon } /> }
			{ imgPath && <img src={ imgPath } alt={ imgAlt } /> }
		</div>
	);
};

export default JetpackCloudIconHeader;
