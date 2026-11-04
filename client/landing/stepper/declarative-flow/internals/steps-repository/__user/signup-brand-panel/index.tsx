import { useTranslate } from 'i18n-calypso';
import './style.scss';

const themeImage = ( name: string ) =>
	`https://wordpress.com/wp-content/uploads/2026/10/ai-hero-card-${ name }.webp`;

const WALL_COLUMNS = [
	[ '01-think-pieces', '04-ceramics', '07-agency', '10-travel-blog' ],
	[ '02-tattoo', '05-bakery', '08-paintings', '11-pet-adoption' ],
	[ '03-coffee', '06-portfolio', '09-board-shop', '04-ceramics' ],
];

export const SignupBrandPanel = () => {
	const translate = useTranslate();

	return (
		<div className="signup-brand-panel">
			<div className="signup-brand-panel__content">
				<div className="signup-brand-panel__wall-fade" aria-hidden="true">
					<div className="signup-brand-panel__wall">
						{ WALL_COLUMNS.map( ( column, columnIndex ) => (
							<div className="signup-brand-panel__column" key={ columnIndex }>
								{ /* Twice over, so the drift loops without a jump. */ }
								{ [ ...column, ...column ].map( ( name, cardIndex ) => (
									<img
										className="signup-brand-panel__card"
										src={ themeImage( name ) }
										alt=""
										loading="lazy"
										key={ cardIndex }
									/>
								) ) }
							</div>
						) ) }
					</div>
				</div>
				<div className="signup-brand-panel__copy">
					<p className="signup-brand-panel__headline">
						{ translate( 'Millions of sites run on WordPress' ) }
					</p>
					<p className="signup-brand-panel__description">
						{ translate(
							'Launch a business, publish a blog, and connect{{br/}}your favorite tools with MCP.',
							{ components: { br: <br /> } }
						) }
					</p>
				</div>
			</div>
		</div>
	);
};
