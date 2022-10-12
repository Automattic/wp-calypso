import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';

class PostUnavailable extends PureComponent {
	render() {
		const error = this.props.post.error;

		if ( ! error ) {
			return null;
		}

		if ( error.status === 404 || error.error === 404 ) {
			// don't render a card for 404s. These are posts that we once had but were deleted.
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card tagName="article" className="reader__card is-error">
				<div className="reader__post-header">
					<h1 className="reader__post-title">
						<div className="reader__post-title-link">
							<span className="reader__placeholder-text">Oops!</span>
						</div>
					</h1>
				</div>

				<div className="reader__post-excerpt">
					<p>
						{ error.status }: { error.message }
					</p>
					{ config.isEnabled( 'reader/full-errors' ) ? (
						<pre>{ JSON.stringify( this.props.post, null, '  ' ) }</pre>
					) : null }
				</div>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( PostUnavailable );
