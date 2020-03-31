/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { isNull, noop, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getPostPresenceCount } from 'state/presence/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function PresenceButton( props ) {
	const { presenceCount, href, onClick, showLabel, tagName, target } = props;
	const translate = useTranslate();

	return React.createElement(
		tagName,
		omitBy(
			{
				className: 'presence-button',
				href: 'a' === tagName ? href : null,
				onClick,
				target: 'a' === tagName ? target : null,
			},
			isNull
		),
		<Gridicon icon="multiple-users" size={ props.size } className="presence-button__icon" />,
		<span className="presence-button__label">
			<span className="presence-button__label-count">{ presenceCount }</span>

			{ showLabel && (
				<span className="presence-button__label-status">
					{ translate( 'Viewing', 'Viewing', {
						context: 'verb',
						count: presenceCount,
					} ) }
				</span>
			) }
		</span>
	);
}

PresenceButton.propTypes = {
	presenceCount: PropTypes.number,
	href: PropTypes.string,
	onClick: PropTypes.func,
	showLabel: PropTypes.bool,
	tagName: PropTypes.string,
	target: PropTypes.string,
};

PresenceButton.defaultProps = {
	presenceCount: 0,
	href: null,
	onClick: noop,
	showLabel: true,
	size: 24,
	tagName: 'li',
	target: null,
};

const mapStateToProps = ( state, ownProps ) => {
	const { post: { global_ID: globalId } = {}, presenceCount } = ownProps;
	return {
		presenceCount: getPostPresenceCount( state, globalId ) || presenceCount,
	};
};

export default connect( mapStateToProps )( PresenceButton );
