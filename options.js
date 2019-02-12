var arcgis_sug_url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&category=Address,Postal&countryCode=USA&maxSuggestions=15&searchExtent=-127,19,-61,50&text=%TEXT";
var arcgis_find_url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?forStorage=false&f=json&";
var scale_color_count = 5;
var cb_2016_options = [
	{
		"name": "Number of avoided premature deaths (high-end estimate, 2020)",
		"ref_id": 'benavomort20',
		"currency": false,
		"decimal_places": 1,
		"chroma_scale": "RdYlBu"
	},
	{
		"name": "Number of avoided premature deaths (high-end estimate, 2030)",
		"ref_id": 'benavomort30',
		"currency": false,
		"decimal_places": 1,
		"chroma_scale": "RdYlBu"
	},	
	{
		"name": "Total monetized benefits (high-end estimate, 2020)",
		"ref_id": 'bentotmon20',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "PRGn"
	},	
	{
		"name": "Total monetized benefits (high-end estimate, 2030)",
		"ref_id": 'bentotmon30',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "PRGn"
	},
	{
		"name": "Monetized benefits - avoided cases of non-fatal illness (high-end estimate, 2020)",
		"ref_id": 'bentotmorb20',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "BrBg"
	},		
	{
		"name": "Monetized benefits - avoided cases of non-fatal illness (high-end estimate, 2030)",
		"ref_id": 'bentotmorb30',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "BrBg"
	},
	{
		"name": "Monetized benefits - avoided premature deaths (high-end estimate, 2020)",
		"ref_id": 'bentotmort20',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "YlOrRd"
	},
	{
		"name": "Monetized benefits - avoided premature deaths (high-end estimate, 2030)",
		"ref_id": 'bentotmort30',		
		"currency": true,
		"decimal_places": 0,
		"chroma_scale": "YlOrRd"	
	},		
];

var styles = {
	"county": {
		color: '#cccccc',
		weight: .5,
		opacity: 1,
		fillOpacity: .7
	},
	"state": {
        weight: 4,
        opacity: 1,
        color: '#000000',
        fill: false
    },			
	"selected": {
		weight: 5,
        color: '#000',
        fillOpacity: .9
	},
	"highlight": {
        weight: 3,
        color: '#666',
        fillOpacity: .7
    }
}

var data_mapping = [
	{
		"name": 'Number of avoided premature deaths',
		"vals": [
			{
				"id": 'b',
				"type": 'low',
				"year": 2020,
				"currency": false
			},
			{
				"id": 'c',
				"type": 'high',
				"year": 2020,
				"currency": false
			},
			{
				"id": 'd',
				"type": 'low',
				"year": 2030,
				"currency": false
			},
			{
				"id": 'e',
				"type": 'high',
				"year": 2030,
				"currency": false
			}
		]
	},
	{
		"name": 'Total monetized benefits',
		"vals": [
			{
				"id": 'f',
				"type": 'low',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'g',
				"type": 'high',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'h',
				"type": 'low',
				"year": 2030,
				"currency": true
			},
			{
				"id": 'i',
				"type": 'high',
				"year": 2030,
				"currency": true
			}
		]
	},
	{
		"name": 'Monetized benefits - avoided premature deaths',
		"vals": [
			{
				"id": 'j',
				"type": 'low',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'k',
				"type": 'high',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'l',
				"type": 'low',
				"year": 2030,
				"currency": true
			},
			{
				"id": 'm',
				"type": 'high',
				"year": 2030,
				"currency": true
			}
		]
	},
	{
		"name": 'Monetized benefits - avoided cases of non-fatal illness',
		"vals": [
			{
				"id": 'n',
				"type": 'low',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'o',
				"type": 'high',
				"year": 2020,
				"currency": true
			},
			{
				"id": 'p',
				"type": 'low',
				"year": 2030,
				"currency": true
			},
			{
				"id": 'q',
				"type": 'high',
				"year": 2030,
				"currency": true
			}
		]
	} /*,
	{
		"name": 'Total monetized benefits related to within-county emissions reductions',
		"vals": [
			{
				"id": 'r',
				"type": 'low',
				"year": 2020,
				"currency": true
			},
			{
				"id": 's',
				"type": 'high',
				"year": 2020,
				"currency": true
			},
			{
				"id": 't',
				"type": 'low',
				"year": 2030,
				"currency": true
			},
			{
				"id": 'u',
				"type": 'high',
				"year": 2030,
				"currency": true
			}
		]
	}*/
];


var state_codes = {
		"01": {"abbrev":'AL', "name": 'Alabama'},
		"02": {"abbrev":'AK', "name": 'Alaska'},
		"04": {"abbrev":'AZ', "name": 'Arizona'},
		"05": {"abbrev":'AR', "name": 'Arkansas'},
		"06": {"abbrev":'CA', "name": 'California'},
		"08": {"abbrev":'CO', "name": 'Colorado'},
		"09": {"abbrev":'CT', "name": 'Connecticut'},
		"10": {"abbrev":'DE', "name": 'Delaware'},
		"11": {"abbrev":'DC', "name": 'District of Columbia'},
		"12": {"abbrev":'FL', "name": 'Florida'},
		"13": {"abbrev":'GA', "name": 'Georgia'},
		"15": {"abbrev":'HI', "name": 'Hawaii'},
		"16": {"abbrev":'ID', "name": 'Idaho'},
		"17": {"abbrev":'IL', "name": 'Illinois'},
		"18": {"abbrev":'IN', "name": 'Indiana'},
		"19": {"abbrev":'IA', "name": 'Iowa'},
		"20": {"abbrev":'KS', "name": 'Kansas'},
		"21": {"abbrev":'KY', "name": 'Kentucky'},
		"22": {"abbrev":'LA', "name": 'Louisiana'},
		"23": {"abbrev":'ME', "name": 'Maine'},
		"24": {"abbrev":'MD', "name": 'Maryland'},
		"25": {"abbrev":'MA', "name": 'Massachusetts'},
		"26": {"abbrev":'MI', "name": 'Michigan'},
		"27": {"abbrev":'MN', "name": 'Minnesota'},
		"28": {"abbrev":'MS', "name": 'Mississippi'},
		"29": {"abbrev":'MO', "name": 'Missouri'},
		"30": {"abbrev":'MT', "name": 'Montana'},
		"31": {"abbrev":'NE', "name": 'Nebraska'},
		"32": {"abbrev":'NV', "name": 'Nevada'},
		"33": {"abbrev":'NH', "name": 'New Hampshire'},
		"34": {"abbrev":'NJ', "name": 'New Jersey'},
		"35": {"abbrev":'NM', "name": 'New Mexico'},
		"36": {"abbrev":'NY', "name": 'New York'},
		"37": {"abbrev":'NC', "name": 'North Carolina'},
		"38": {"abbrev":'ND', "name": 'North Dakota'},
		"39": {"abbrev":'OH', "name": 'Ohio'},
		"40": {"abbrev":'OK', "name": 'Oklahoma'},
		"41": {"abbrev":'OR', "name": 'Oregon'},
		"42": {"abbrev":'PA', "name": 'Pennsylvania'},
		"44": {"abbrev":'RI', "name": 'Rhode Island'},
		"45": {"abbrev":'SC', "name": 'South Carolina'},
		"46": {"abbrev":'SD', "name": 'South Dakota'},
		"47": {"abbrev":'TN', "name": 'Tennessee'},
		"48": {"abbrev":'TX', "name": 'Texas'},
		"49": {"abbrev":'UT', "name": 'Utah'},
		"50": {"abbrev":'VT', "name": 'Vermont'},
		"51": {"abbrev":'VA', "name": 'Virginia'},
		"53": {"abbrev":'WA', "name": 'Washington'},
		"54": {"abbrev":'WV', "name": 'West Virginia'},
		"55": {"abbrev":'WI', "name": 'Wisconsin'},
		"56": {"abbrev":'WY', "name": 'Wyoming'},
		"60": {"abbrev":'AS', "name": 'American Samoa'},
		"66": {"abbrev":'GU', "name": 'Guam'},
		"69": {"abbrev":'MP', "name": 'Northern Mariana Islands'},
		"72": {"abbrev":'PR', "name": 'Puerto Rico'},
		"74": {"abbrev":'UM', "name": 'U.S. Minor Outlying Islands'},
		"78": {"abbrev":'VI', "name": 'U.S. Virgin Islands'}
}

var lsad_codes = {
		"00": '',
		"06": 'County',
		"12": 'Municipality',
		"15": 'Parish',
		"25": 'City'
}