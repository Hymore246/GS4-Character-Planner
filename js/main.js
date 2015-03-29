	var active_panel = "";

	function Planner_Init() {					
		StatisticsPanel_Calculate_Growth_All();
		StatisticsPanel_Calculate_Resources();
		SkillsPanel_Update_Available_Skills();
//		ManeuversPanel_Update_Available_Maneuvers();	
	
		Planner_Show_Panel("skills");		
	}	
	
	function Planner_Show_Panel(id) {		
		var div = document.getElementById('panel_container');
				
		if( active_panel == id ) {
			return 0;
		}
		else if( active_panel ) {
			document.getElementById(active_panel+"_tab").style.backgroundColor = "lightgray";			
		}

		active_panel = id;
		
		document.getElementById(id+"_tab").style.backgroundColor = "white";					
		
			switch(id) {
				case "statistics":	m.module(div, {controller: StP_MCV.controller, view: StP_MCV.view});
						//			$("#StP_growth_container").scrollLeft(scroller_H);
									break;
				case "skills":		m.module(div, {controller: SkP_MCV.controller, view: SkP_MCV.view});
							//		$("#SkP_skills_training_container").scrollLeft(scroller_H);
									break;
				case "maneuvers":					
					//				$("#ManP_maneuvers_training_container").scrollLeft(scroller_H);
									break;
			}
			
	}	
	
	function Planner_Panels_Update_Profession_Race() {				
		StatisticsPanel_Calculate_Growth_All();
		StatisticsPanel_Calculate_Resources();
		SkillsPanel_Update_Available_Skills();
/*		
		SkillsPanel_Update_Available_Skills();
		ManeuversPanel_Update_Available_Maneuvers();
		switch(Planner_Get_Active_Panel()) {
			case "statistics":	StatisticsPanel_On_Prof_Change();
								break;
			case "skills":		SkillsPanel_On_Prof_Change();
								break;
			case "maneuvers":	ManeuversPanel_On_Prof_Change();								
								break;
		}
*/		
	}	
		
	function Planner_File_Onchange(caller) {
		var reader = new FileReader();
		reader.onload = function(e) {
			Planner_Load_Character(e.target.result);			
		};	
		reader.readAsText(caller.files[0]);		
	}
	
	function Planner_Load_Character(filedata) {
		var lines = filedata.split("\n");
		var parts, subparts, mode = 0, prof;
				
		for( var i=0; i < lines.length; i++ ) {
			if( lines[i].length  <= 0 ){
				continue;
			}
			
			if( lines[i] == "STATISTICS" ) {
				mode = 1;				
			}			
			else if( lines[i] == "SKILLS" ) {
				mode = 2;				
			}
			else if( lines[i] == "MANEUVERS" ) {
				mode = 3;			
			}
			else {
				parts = lines[i].split(":");
				if( parts.length < 2 ) {
					alert("PARSE ERROR FOR LINE: "+parts.length);
					break;
				}
				
				switch(mode) {
					case 0: //PLANNER
							switch(parts[0]) {
								case "VERSION": 			break;
								
								case "BUILDNAME": 			document.getElementById("build_name").value = parts[1];
															break;
								case "SKILLPANEL_HIDE": 	if( parts[1] == "true" ) {
																hide_unused_skills = true;
															}
															break;
														
								case "MANEUVERPANEL_HIDE": 	if( parts[1] == "true" ) {
																hide_unused_maneuvers = true;
															}
															break;		

								case "PROFESSION": 			selected_prof = parts[1];
															break;
															
								case "RACE": 				selected_race = parts[1];
															break;
							}
							break;
					
					case 1: //STATISTICS
							statistics_by_level[parts[0]][0] = parseInt(parts[1]);
							break;
				
					case 2: //SKILLS
							parts = lines[i].split("|");
							name = parts[0].split(":")[0];
							
							if( parts[0].split(":")[1] == "true" ) {
								hidden_skills[name] = true;
							}
							
							if( parts[1].split(":")[1] != "undefined" ) {     //rate
								training_rate[name]= parts[1].split(":")[1];							
							}
							
							if( parts[2].split(":").length > 1 ) {
								subparts = parts[2].split(":")[1].split(",");
								
								for(var j=0; j < subparts.length-1; j++) {		
									ranks_by_level[parseInt(subparts[j].split("=")[0])][name] = parseInt(subparts[j].split("=")[1])
								}
								
	//							SkillsPanel_Calculate_Total_Ranks(name, 0);
	//							SkillsPanel_Training_Update_Row(name, 0);
							}
							break;
							
					case 3: //MANEUVERS
							parts = lines[i].split("|");
							name = parts[0].split(":")[0];
							
							if( parts[0].split(":")[1] == "true" ) {
								hidden_maneuvers[name] = true;
							}
							
							if( parts[1].split(":").length > 1 ) {
								subparts = parts[1].split(":")[1].split(",");
								
								for(var j=0; j < subparts.length-1; j++) {									
									man_ranks_by_level[parseInt(subparts[j].split("=")[0])][name] = parseInt(subparts[j].split("=")[1])
								}
					//			alert(name.split("-")[0]);
	//							ManeuversPanel_Calculate_Total_Ranks(name.split("@")[0], 0);
	//							ManeuversPanel_Training_Update_Row(name.split("@")[0], 0);
							}
							break;
				}
			}			
		}		
		
		StatisticsPanel_Calculate_Growth_All();
		StatisticsPanel_Calculate_Resources();
		SkillsPanel_Update_Available_Skills();
		ManeuversPanel_Update_Available_Maneuvers();	
		switch(Planner_Get_Active_Panel()) {
			case "statistics"://	StatisticsPanel_On_Prof_Change();
								break;
			case "skills":	//	SkillsPanel_On_Prof_Change();
								SkillsPanel_Term();
								break;
			case "maneuvers"://	ManeuversPanel_On_Prof_Change();	
								ManeuversPanel_Term();
								break;
		}
		
		Planner_Show_Panel("statistics");	
	}
	
	function Planner_Save_Character() {
		char_data = "";
		var man;
		var temp = "";
		/*FORMAT FOR CHARACTER SAVE FILE
		 //PLANNER
		 VERSION:xxx
		 BUILDNAME:xxxxx
		 SKILLPANEL_HIDE:xxx
		 MANEUVERPANEL_HIDE:xxx
		 PROFESSION:xxx
		 RACE:xxx
		 //STATISTICS		 
		 strength:xxx
		 constitution:xxx
		 dexterity:xxx
		 agility:xxx
		 displine:xxx
		 aura:xxx
		 logic:xxx
		 intuition:xxx
		 wisdom:xxx
		 influence:xxx
		 //SKILLS, entry only appears if training for it exists
		 <skill name>:<0-1 for checkbox>|rate:<rate>|training:<Lvl#=ranks@lvl>,<Lvl#=ranks@lvl>, ...
		 ...
		 ...
		 //MANEUVERS, entry only appears if training for it exists
		 <maneuvers name>-<maneuver type>:<0-1 for checkbox>|rate:<rate>|training:<Lvl#=ranks@lvl>,<Lvl#=ranks@lvl>, ...
		 ...
		 ...		
		*/		
		char_data += "VERSION:" + VERSION + "\n";
		char_data += "BUILDNAME:" + Planner_Escape_Special(document.getElementById("build_name").value || "YourChar") + "\n";
		char_data += "SKILLPANEL_HIDE:" + hide_unused_skills + "\n";
		char_data += "MANEUVERPANEL_HIDE:" + hide_unused_maneuvers + "\n";	
		char_data += "PROFESSION:" + selected_prof + "\n";	
		char_data += "RACE:" + selected_race + "\n";	
		char_data += "STATISTICS" + "\n";
		for( var i=0; i < statistics.length; i++ ) {
			char_data += statistics[i] + ":" + statistics_by_level[statistics[i]][0] + "\n"; 		
		}
		
		char_data += "SKILLS" + "\n";
		for( var i=0; i < all_skills.length; i++ ) {
			temp = "";
			for( var j=0; j <= 100; j++ ) {
				if( ranks_by_level[j][all_skills[i]] != undefined ) {
					temp += j + "=" + ranks_by_level[j][all_skills[i]] +",";
				}				
			}	
			
			if( temp != "" || hidden_skills[all_skills[i]] != undefined || training_rate[all_skills[i]] != undefined ) {
				char_data += all_skills[i] + ":" + hidden_skills[all_skills[i]];
				char_data += "|rate:" + training_rate[all_skills[i]];
				char_data += "|training:"+temp; 
				char_data += "\n"; 		
			}
			
		}
		
		char_data += "MANEUVERS" + "\n";
		for( var i=0; i < avail_maneuvers.list.length; i++ ) {
			man = avail_maneuvers.list[i].name +"@" + avail_maneuvers.list[i].type;			
			temp = "";
			
			for( var j=0; j <= 100; j++ ) {
				if( man_ranks_by_level[j][man] != undefined ) {
					temp += j + "=" + man_ranks_by_level[j][man] +",";
				}				
			}			
			
			if( temp != "" || hidden_skills[all_skills[i]] != undefined ) {
				char_data += man + ":" + hidden_maneuvers[man];
				char_data += "|training:"+temp; 		
				char_data += "\n"; 
			}
		}		
		
		document.getElementById('save_char_link').click();	
	}
	
	function Planner_Escape_Special(txt) {
		return txt
         .replace(/:/g, "")
         .replace(/\*/g, "")
         .replace(/\?/g, "")
         .replace(/\|/g, "")
         .replace(/"/g, "")
         .replace(/&/g, "")
         .replace(/</g, "")
         .replace(/>/g, "")
         .replace(/\//g, "")
         .replace(/\\/g, "");
 
	}
