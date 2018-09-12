/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { uniqueId } from 'lodash';

export const withUniqueDraftId = WrappedComponent => {
	return class extends Component {
		constructor( props ) {
			super( props );

			this.state = {
				uniqueDraftId: uniqueId( 'gutenberg-draft-' ),
			};
		}

		render() {
			const { uniqueDraftId } = this.state;

			return <WrappedComponent { ...{ ...this.props, uniqueDraftId } } />;
		}
	};
};
