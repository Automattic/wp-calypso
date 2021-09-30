import { Gridicon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
} from 'calypso/lib/url/support';
import { modeType } from './constants';

import './style.scss';

export default function ConnectDomainStepSupportInfoLink( { baseClassName, mode } ) {
	const { __ } = useI18n();
	const supportLink = {
		[ modeType.SUGGESTED ]: MAP_DOMAIN_CHANGE_NAME_SERVERS,
		[ modeType.ADVANCED ]: MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
		[ modeType.DONE ]: MAP_DOMAIN_CHANGE_NAME_SERVERS,
	};

	const classes = classNames(
		baseClassName + '__support-documentation',
		baseClassName + '__info-links'
	);

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
						a: createElement( 'a', { href: supportLink[ mode ], target: '_blank' } ),
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
