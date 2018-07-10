/**
 * External dependencies
 */
import uuid from 'uuid/v4';

/**
 * WordPress dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';

/**
 * Internal dependencies
 */
import NoticeList from '../../notice/list';

/**
 * Override the default edit UI to include notices if supported.
 *
 * @param  {function|Component} OriginalComponent Original component.
 * @return {Component}                            Wrapped component.
 */
export default createHigherOrderComponent( ( OriginalComponent ) => {
	return class WrappedBlockEdit extends Component {
		constructor() {
			super( ...arguments );

			this.createNotice = this.createNotice.bind( this );
			this.createErrorNotice = this.createErrorNotice.bind( this );
			this.removeNotice = this.removeNotice.bind( this );
			this.removeAllNotices = this.removeAllNotices.bind( this );

			this.state = {
				noticeList: [],
			};

			this.noticeOperations = {
				createNotice: this.createNotice,
				createErrorNotice: this.createErrorNotice,
				removeAllNotices: this.removeAllNotices,
				removeNotice: this.removeNotice,
			};
		}

		/**
		* Function passed down as a prop that adds a new notice.
		*
		* @param {Object} notice  Notice to add.
		*/
		createNotice( notice ) {
			const noticeToAdd = notice.id ? notice : { ...notice, id: uuid() };
			this.setState( ( state ) => ( {
				noticeList: [ ...state.noticeList, noticeToAdd ],
			} ) );
		}

		/**
		* Function passed as a prop that adds a new error notice.
		*
		* @param {string} msg  Error message of the notice.
		*/
		createErrorNotice( msg ) {
			this.createNotice( { status: 'error', content: msg } );
		}

		/**
		* Removes a notice by id.
		*
		* @param {string} id  Id of the notice to remove.
		*/
		removeNotice( id ) {
			this.setState( ( state ) => ( {
				noticeList: state.noticeList.filter( ( notice ) => notice.id !== id ),
			} ) );
		}

		/**
		* Removes all notices
		*/
		removeAllNotices() {
			this.setState( {
				noticeList: [],
			} );
		}

		render() {
			return (
				<OriginalComponent
					noticeList={ this.state.noticeList }
					noticeOperations={ this.noticeOperations }
					noticeUI={
						this.state.noticeList.length > 0 && <NoticeList
							className="components-with-notices-ui"
							notices={ this.state.noticeList }
							onRemove={ this.removeNotice }
						/>
					}
					{ ...this.props }
				/>
			);
		}
	};
} );
