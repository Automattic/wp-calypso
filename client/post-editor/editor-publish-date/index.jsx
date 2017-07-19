/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';

export class EditorPublishDate extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			open: false,
		};
	}

	toggleOpenState = () => {
		this.setState( { open: ! this.state.open } );
	}

	renderHeader() {
		const className = classNames( 'editor-publish-date__header', { 'is-open': this.state.open } );

		return (
			<div className={ className } onClick={ this.toggleOpenState }>
				<Gridicon icon="calendar" size={ 18 } /> Publish Now
			</div>
		);
	}

	renderSchedule() {
		const className = classNames( 'editor-publish-date__schedule', {} );
		return (
			<div className={ className }>
				<PostSchedule displayInputChrono={ false } />
			</div>
		);
	}

	render() {
		return (
			<div className="editor-publish-date">
				<div className="editor-publish-date__wrapper">
					{ this.renderHeader() }
					{ this.state.open && this.renderSchedule() }
				</div>
			</div>
		);
	}

}

export default connect(
	() => {
		return {};
	},
	{}
)( localize( EditorPublishDate ) );
