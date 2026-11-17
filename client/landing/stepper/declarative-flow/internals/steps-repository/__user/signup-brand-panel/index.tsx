import { useTranslate } from 'i18n-calypso';
import './style.scss';

// Examples from the AI website builder page and real themes from the logged-out homepage, sized
// for a card at 2x.
const aiExample = ( name: string ) =>
	`https://wordpress.com/wp-content/uploads/2026/10/ai-hero-card-${ name }.webp?w=640`;
const theme = ( name: string ) =>
	`https://wordpress.com/wp-content/uploads/2025/04/${ name }-desktop.webp?w=640`;

const WALL_COLUMNS = [
	[
		aiExample( '01-think-pieces' ),
		theme( 'stranger' ),
		aiExample( '04-ceramics' ),
		aiExample( '07-agency' ),
		aiExample( '10-travel-blog' ),
	],
	[
		aiExample( '02-tattoo' ),
		theme( 'dropp' ),
		aiExample( '05-bakery' ),
		aiExample( '08-paintings' ),
		aiExample( '11-pet-adoption' ),
	],
	[
		theme( 'alter' ),
		aiExample( '03-coffee' ),
		theme( 'clairevoyant' ),
		aiExample( '09-board-shop' ),
		aiExample( '06-portfolio' ),
	],
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
								{ /* An even number of times, so the drift loops without a jump, and enough to fill tall panels. */ }
								{ [ ...column, ...column, ...column, ...column ].map( ( src, cardIndex ) => (
									<img
										className="signup-brand-panel__card"
										src={ src }
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
							'Launch a business, publish a blog, and connect {{br/}}your favorite tools with MCP.',
							{ components: { br: <br /> } }
						) }
					</p>
				</div>
			</div>
		</div>
	);
};
