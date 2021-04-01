/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

export default function Theme( props ) {
	const { name, screenshot, active, actions } = props.theme;
	const themeClass = active ? 'theme active' : 'theme';
	return (
		<div className={ themeClass }>
			<div className="theme-screenshot">
				<img src={ screenshot[ 0 ] } alt="" />
			</div>
			<div className="theme-id-container">
				<h2 className="theme-name" id="pub/tt1-blocks-name">
					{ active && <span>Active:</span> }
					{ name }
				</h2>
				<div className="theme-actions">
					{ active ? (
						<Button href={ actions.customize } isPrimary>
							Customize
						</Button>
					) : (
						<>
							<Button href={ actions.activate } isPrimary>
								Activate
							</Button>
							<Button href={ actions.customize } isSecondary>
								Preview
							</Button>
						</>
					) }
				</div>
			</div>
		</div>
	);
}
