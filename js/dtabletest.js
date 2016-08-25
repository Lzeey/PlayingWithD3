function datatables_csv(fileuri, tableid, dtoptions) {
  if (typeof dtoptions === 'undefined') { dtoptions = {}; }
    
    dtoptions = {      
        'columnDefs': [{
         'targets': [6,7],
         'searchable': false,
         'orderable': false,
         'className': 'dt-body-center',
         'render': function (data, type, full, meta){
             return '<input type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
         }
      }]};
    
  d3.text(fileuri, function (datasetText) {
 
    var rows = d3.csvParseRows(datasetText);
    rows[0].push('Flag');
    rows[0].push('Normal');
    rows.slice(1).map(function(d){
        d.push(d[0]); //grab the ID
        d.push(d[0]+'OK'); //Ok checkbox
        return d});
      
      
    var tbl = d3.select("#" + tableid);
    // headers
    tbl.append("thead").append("tr")
        .selectAll("th")
        .data(rows[0])
        .enter().append("th")
        .text(function(d) { return d; });

    // data
    tbl.append("tbody")
        .selectAll("tr")
        .data(rows.slice(1))
        .enter()
        .append("tr")
        .selectAll("td")
          .data(function(d){ return d; })
        .enter().append("td")
          .text(function(d){ return d; });
 
    jQuery(document).ready(function() {
      jQuery("#" + tableid).DataTable(dtoptions);
    });
    
    //Checkbox action
     $('#example tbody').on('change', 'input[type="checkbox"]', function(){
      // If checkbox is not checked
      if(!this.checked){
          console.log('uncheck!' + $(this).attr('name'))
         var el = $('#example-select-all').get(0);
         // If "Select all" control is checked and has 'indeterminate' property
         if(el && el.checked && ('indeterminate' in el)){
            // Set visual state of "Select all" control 
            // as 'indeterminate'
            el.indeterminate = true;
         }
      }else{console.log('checked!')};
   });
      
  //
      
  });
}