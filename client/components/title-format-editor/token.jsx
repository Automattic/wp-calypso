import React, { Component, PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export class Token extends Component {
	static propTypes = {
		onClick: PropTypes.func,
		onMouseEnter: PropTypes.func,
		onMouseLeave: PropTypes.func,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isActive: false,
		};
	}

	activate = () => this.setState( { isActive: true }, this.props.onMouseEnter );
	deactivate = () => this.setState( { isActive: false }, this.props.onMouseLeave );

	render() {
		const {
			children,
			entityKey,
			onClick,
		} = this.props;
		const { isActive } = this.state;

		// please ignore the formatting below
		// if we allow spaces it will mess up
		// the way the component renders in
		// the draft-js editor
		return (
			<span
				className="title-format-editor__token"
				onClick={ onClick( entityKey ) }
				onMouseEnter={ this.activate }
				onMouseLeave={ this.deactivate }
			>{ children }{ isActive &&
				<Gridicon
					className="title-format-editor__token-close"
					icon="cross-small"
				/>
			}</span>
		);
	}
}

export default Token;
