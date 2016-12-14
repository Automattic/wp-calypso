/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { omit } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

const InfoLink = ( props ) => {
	const otherProps = omit( props, [ 'children', 'href', 'className' ] );
	return (
		<InfoPopover className={ classNames( 'info-link', props.className ) } { ...otherProps }>
				<ExternalLink icon={ true } href={ props.href } >
					{ props.children }
				</ExternalLink>
		</InfoPopover>
	);
};

InfoLink.propTypes = {
	href: PropTypes.string.isRequired
};

export default InfoLink;
