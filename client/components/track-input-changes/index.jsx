import PropTypes from 'prop-types';
import { Children, cloneElement, Component } from 'react';

const noop = () => {};

export default class TrackInputChanges extends Component {
	static displayName = 'TrackInputChanges';

	static propTypes = {
		onNewValue: PropTypes.func,
	};

	static defaultProps = {
		onNewValue: noop,
	};

	UNSAFE_componentWillMount() {
		this.inputEdited = false;
	}

	onInputChange = () => {
		this.inputEdited = true;
	};

	onInputBlur = ( event ) => {
		if ( this.inputEdited ) {
			this.props.onNewValue( event );
			this.inputEdited = false;
		}
	};

	render() {
		// Multiple children not supported
		const child = Children.only( this.props.children );

		const props = {
			...child.props,
			onChange: ( event ) => {
				if ( typeof child.props.onChange === 'function' ) {
					child.props.onChange.call( child, event );
				}
				this.onInputChange( event );
			},
			onBlur: ( event ) => {
				if ( typeof child.props.onBlur === 'function' ) {
					child.props.onBlur.call( child, event );
				}
				this.onInputBlur( event );
			},
		};

		return cloneElement( child, props );
	}
}
