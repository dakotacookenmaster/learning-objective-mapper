import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export interface SimpleDialogProps {
  open: boolean;
  warnings: Record<string, any>,
  handleClose: () => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { handleClose, open, warnings } = props;

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Course Sequence Warnings</DialogTitle>
      <List sx={{ pt: 0 }}>
        {Object.entries(warnings).map((data) => (
          <ListItem key={data[0]}>
            <details>
                <summary>{ data[1].message }</summary>
                    { data[1].paths.map((path: string[], index: number) => {
                        return (
                            <p style={{ paddingLeft: "10px" }} key={index}>{ path.reduce((accumulator, currentPath, index) => {
                                if(index !== path.length - 1) {
                                    return accumulator + currentPath + " ➡️ "
                                } else {
                                    return accumulator + currentPath
                                }
                            }, "") }</p>
                        )
                    })}
            </details>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default SimpleDialog