import { Gridicon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { modeType } from './constants';

import './style.scss';

export default function ConnectDomainStepSupportInfoLink( { baseClassName, mode } ) {
	const { __ } = useI18n();
	const supportContext = {
		[ modeType.SUGGESTED ]: 'map-domain-change-name-servers',
		[ modeType.ADVANCED ]: 'map-domain-update-a-records',
		[ modeType.DONE ]: 'map-domain-change-name-servers',
	};

	if ( ! supportContext[ mode ] ) {
		return null;
	}

	const classes = clsx( baseClassName + '__support-documentation', baseClassName + '__info-links' );

	return (
		<div className={ classes }>
			<Gridicon
				className={ baseClassName + '__info-links-icon' }
				icon="help-outline"
				size={ 16 } /* eslint-disable-line */
			/>{ ' ' }
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement(
					__( 'Not finding your way? You can read our detailed <a>support documentation</a>.' ),
					{
						a: createElement( InlineSupportLink, {
							supportContext: supportContext[ mode ],
							showIcon: false,
						} ),
					}
				) }
			</span>
		</div>
	);
}

ConnectDomainStepSupportInfoLink.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
};
