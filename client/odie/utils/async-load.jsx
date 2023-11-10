import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

function omit( obj, fields ) {
	const newObj = { ...obj };
	for ( const field of fields ) {
		if ( newObj.hasOwnProperty( field ) ) {
			delete newObj[ field ];
		}
	}
	return newObj;
}

export default class AsyncLoad extends Component {
	static propTypes = {
		placeholder: PropTypes.node,
		require: PropTypes.func.isRequired,
	};

	static defaultProps = {
		placeholder: <div className="async-load__placeholder" />,
	};

	state = { component: null };

	componentDidMount() {
		this.mounted = true;
		this.require();
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.mounted && this.props.require !== nextProps.require ) {
			this.setState( { component: null } );
		}
	}

	componentDidUpdate( prevProps ) {
		// Our Babel transform will hoist the require function in the rendering
		// component, so we can compare the reference with confidence
		if ( this.props.require !== prevProps.require ) {
			this.require();
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	require() {
		const requireFunction = this.props.require;

		requireFunction( ( component ) => {
			if ( this.mounted && this.props.require === requireFunction ) {
				this.setState( { component } );
			}
		} );
	}

	render() {
		if ( this.state.component ) {
			const props = omit( this.props, [ 'placeholder', 'require' ] );

			return <this.state.component { ...props } />;
		}

		return this.props.placeholder;
	}
}
