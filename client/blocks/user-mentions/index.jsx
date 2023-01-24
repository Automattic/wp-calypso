import PropTypes from 'prop-types';
import { PureComponent, forwardRef } from 'react';
import addUserMentions from './add';
import connectUserMentions from './connect';

/**
 * withUserMentions is a higher-order component that adds connected user mention support to whatever input it wraps.
 *
 * @example withUserMentions( Component )
 * @param {Object} WrappedComponent - React component to wrap
 * @returns {Object} the enhanced component
 */
const withUserMentions = ( WrappedComponent ) => {
	class TextInputWrapper extends PureComponent {
		static propTypes = {
			siteId: PropTypes.number,
		};

		render() {
			return <WrappedComponent { ...this.props } ref={ this.props.forwardedRef } />;
		}
	}

	return connectUserMentions(
		addUserMentions(
			forwardRef( ( props, ref ) => {
				return <TextInputWrapper { ...props } forwardedRef={ ref } />;
			} )
		)
	);
};

export default withUserMentions;
