const save = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
	className,
} ) => (
	<div
		className={ className }
		itemprop="address"
		itemscope
		itemtype="http://schema.org/PostalAddress"
	>
		{ address && <div itemprop="streetAddress">{ address }</div> }
		{ addressLine2 && <div itemprop="streetAddress">{ addressLine2 }</div> }
		{ addressLine3 && <div itemprop="streetAddress">{ addressLine3 }</div> }
		{ city && ! ( region || postal ) && <div itemprop="addressLocality">{ city }</div> }
		{ city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressLocality">{ city }</span>,
					', ',
					<span itemprop="addressRegion">{ region }</span>,
					' ',
					<span itemprop="postalCode">{ postal }</span>,
				] }
			</div>
		) }
		{ ! city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressRegion">{ region }</span>,
					' ',
					<span itemprop="postalCode">{ postal }</span>,
				] }
			</div>
		) }
		{ country && <div itemprop="addressCountry">{ country }</div> }
	</div>
);

export default save;
