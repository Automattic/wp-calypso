open Js;

let component = ReasonReact.statelessComponent "ReasonableDemo";

let text = ReasonReact.stringToElement;

let make ::name ::count ::onClick _children => {
  let clickIt _event _state _self => onClick () [@bs];
  {
    ...component,
    render: fun () self =>
      <div>
        <label> (text name) </label>
        <button _type="button" className="button is-compact" onClick=(self.update clickIt)>
          (text (" -> " ^ count))
        </button>
      </div>
  }
};

let comp =
  ReasonReact.wrapReasonForJs
    ::component
    (fun jsProps => make name::jsProps##name count::jsProps##count onClick::jsProps##onClick [||]);

let counter state::(state: undefined int) action => {
  let prev =
    switch (Undefined.to_opt state) {
    | Some s => s
    | None => 0
    };
  switch action##_type {
  | "RD_INC" => prev + 1
  | _ => prev
  }
};

let inc () => {"_type": "RD_INC"};
