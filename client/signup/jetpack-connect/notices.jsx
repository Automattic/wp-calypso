import React, { PropTypes } from 'react';

import Notice from 'components/notice';

export default React.createClass( {
	displayName: 'JetpackConnectNotices',

	propTypes: {
		isError: PropTypes.bool,
		jetpackIsDeactivated: PropTypes.bool,
		jetpackIsDisconnected: PropTypes.bool,
		jetpackIsValid: PropTypes.bool,
		jetpackNotInstalled: PropTypes.bool
	},

	render() {
		return (
			<div className="jetpack-connect__notices-container">
				{ this.props.isError
					? ( <Notice
						status="is-warning"
						icon="trash"
						onDismissClick={ this.props.onDismissClick }
						text="That's not a real web site" /> )
					: null
				}
				{ this.props.jetpackIsDeactivated
					? ( <Notice
						status="is-warning"
						onDismissClick={ this.props.onDismissClick }
						icon="block"
						text="Jetpack is deactivated" /> )
					: null
				}
				{ this.props.jetpackIsDisconnected
					? ( <Notice
						status="is-warning"
						icon="link-break"
						onDismissClick={ this.props.onDismissClick }
						text="Jetpack is disconnected" /> )
					: null
				}
				{ this.props.jetpackIsValid
					? ( <Notice
						status="is-success"
						icon="plugins"
						onDismissClick={ this.props.onDismissClick }
						text="Jetpack is connected" /> )
					: null
				}
				{ this.props.jetpackNotInstalled
					? ( <Notice
						status="is-error"
						icon="status"
						onDismissClick={ this.props.onDismissClick }
						text="Can't find Jetpack" /> )
					: null
				}
			</div>
		);
	}
} );
