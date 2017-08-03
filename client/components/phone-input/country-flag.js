/** External Dependencies */
import React from 'react';
import Gridicon from 'gridicons';

/** Internal Dependencies */
import Spinner from 'components/spinner';

export default React.createClass( {
	propTypes: {
		countryCode: React.PropTypes.string.isRequired
	},
	getInitialState() {
		return {
			ready: false,
			error: false
		};
	},

	componentDidUpdate( oldProps ) {
		if ( this.props.countryCode && this.props.countryCode !== oldProps.countryCode ) {
			this.setState( { ready: false, error: false } );
		}
	},

	renderSpinner() {
		if ( ( ! this.props.countryCode || ! this.state.ready ) && ! this.state.error ) {
			return <Spinner size={ 16 } className="phone-input__flag-spinner" />;
		}
	},

	handleImageLoad() {
		this.setState( { ready: true, error: false } );
	},

	handleImageError() {
		this.setState( { ready: false, error: true } );
	},

	renderFlag() {
		const style = this.state.ready ? {} : { visibility: 'hidden' };

		if ( this.props.countryCode ) {
			if ( ! this.state.error ) {
				return (
					<img
						onLoad={ this.handleImageLoad }
						onError={ this.handleImageError }
						src={ `/calypso/images/flags/${ this.props.countryCode }.svg` }
						className="phone-input__flag-icon"
						style={ style }
					/>
				);
			} else {
				return <Gridicon icon="globe" size={ 24 } className="phone-input__flag-icon" />;
			}
		}
	},
	render() {
		return (
			<div className="phone-input__flag-container">
				{ this.renderSpinner() }
				{ this.renderFlag() }
				<Gridicon icon="chevron-down" size={ 12 } className="phone-input__flag-selector-icon" />
			</div>
		);
	}
} );
