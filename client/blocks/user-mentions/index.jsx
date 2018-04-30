/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import connectUserMentions from './connect';
import addUserMentions from './add';

const withUserMentions = WrappedComponent => {
	class TextInputWrapper extends React.PureComponent {
		static propTypes = {
			siteId: PropTypes.number,
		};

		render() {
			return <WrappedComponent { ...this.props } ref={ this.props.forwardedRef } />;
		}
	}

	return connectUserMentions(
		addUserMentions(
			React.forwardRef( ( props, ref ) => {
				return <TextInputWrapper { ...props } forwardedRef={ ref } />;
			} )
		)
	);
};

export default withUserMentions;
