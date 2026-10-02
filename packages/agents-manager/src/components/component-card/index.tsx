import { SurfaceRenderer, useComponentSession } from '@automattic/agent-components';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import '@automattic/agent-components/style.css';
import type { ComponentSessionOptions } from '@automattic/agent-components';

class PresentationBoundary extends Component<
	{ children: React.ReactNode; onFailure: () => void; fallback: React.ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch() {
		this.props.onFailure();
	}

	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
}

function LiveComponentCard( props: ComponentSessionOptions ) {
	const locale = props.locale ?? getLocaleSlug() ?? 'en';
	const { result, phase, error, allowedActions, actionBindings, submit, failPresentation } =
		useComponentSession( {
			...props,
			locale,
			messages: {
				presentationFailure: __(
					'This confirmation could not be displayed. Check the site before requesting another proposal.',
					__i18n_text_domain__
				),
				invalidInput: __( 'Check the form values and try again.', __i18n_text_domain__ ),
				unverifiedOutcome: __(
					'The action outcome could not be verified. Check the site before requesting another proposal.',
					__i18n_text_domain__
				),
				expired: __( 'This action expired. Request a new proposal.', __i18n_text_domain__ ),
				continuationFailure: __(
					'The action completed, but the agent could not continue. Check the completed result above.',
					__i18n_text_domain__
				),
			},
		} );
	if ( ! result ) {
		return null;
	}
	if ( props.presentationFailed ) {
		return (
			<div>
				<p>{ result.summary }</p>
				{ error && <p role="status">{ error }</p> }
			</div>
		);
	}
	return (
		<div>
			<PresentationBoundary onFailure={ failPresentation } fallback={ <p>{ result.summary }</p> }>
				<SurfaceRenderer
					surface={ result.surface }
					allowedActions={ allowedActions }
					actionBindings={ actionBindings }
					disabled={ phase !== 'ready' }
					pending={ phase === 'pending' }
					locale={ locale }
					messages={ { pending: __( 'Submitting…', __i18n_text_domain__ ) } }
					identity={ result.instanceId }
					onAction={ submit }
				/>
			</PresentationBoundary>
			{ error && <p role="status">{ error }</p> }
		</div>
	);
}

export default function ComponentCard( { options }: { options?: ComponentSessionOptions } ) {
	return options ? (
		<LiveComponentCard key={ options.result.instanceId } { ...options } />
	) : (
		<p>{ __( 'This action is unavailable.', __i18n_text_domain__ ) }</p>
	);
}
