import React from 'react'
import { Modal, Button, Tooltip, OverlayTrigger } from 'react-bootstrap'; 
import { ImputNumber, Card, notification, message } from 'antd';
import { EyeOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';


import CountUp from './CountUp.js';
import axios from "../commons/axios";

const { Meta } = Card;

// export default function OrderBrief(props) {
//     const snacks = props.order.snacks.map((snack) => <li key={snack.name}>{snack.name} - qty: {snack.qty}</li>);
//     const [modalVisible, setModalVisible] = useState(false);
//     const handleClose = () => setModalVisible(false);
//     const handleShow = () => setModalVisible(true);
    
//     const renderTooltip = (props) => (
//         <Tooltip id="button-tooltip" {... props}>
//             feature still in progress
//         </Tooltip>
//     );

//     const getTime = () => {
//         console.log(new Date())
//     }

//     return (
//         <div>
//             <Modal visible={modalVisible} title = {"OrderId: " + props.order._id}
//                 onOk={handleClose} onCancel= {handleClose}>
//                 <p>Vendor: {props.order.vendor._id}</p>
//                 <p>{snacks}</p >
//             </Modal>
        
//             <Card style={{ margin: "10px" }}
//                 actions={[<EyeOutlined onClick={handleShow} />,
//                     <EditOutlined onClick={getTime}/>
//                     ]}>
//                 <Meta title={"VendorId: " + props.order.vendor._id + " - " + props.order.status}/>
//                 <CountUp updatedAt={props.order.updatedAt}/>
//             </Card>
//         </div>
//     ) 
// }

export default class   extends React.Component {

    constructor(props){
        super();
        this.state = {
            menu: [],
            order: [],
            modalVisible: false,
            editModalVisibale: false,
            modalBody: <> </>,
            diff: ""
        }
    }

    handleClose = () => this.setState({modalVisible: false});
    handleShow = () => this.setState({modalVisible: true});

    handleEditClose = () => this.setState({editModalVisible: false});
    handleEditShow = () => this.setState({editModalVisible: true});

    onChange = (index, event) => {
        let newArray = [...this.state.order];
        newArray[index] = event;
        this.setState({order: newArray});

    }

    tick(){
        let now = new Date().getTime()
        let upd = Date.parse(this.props.order.updatedAt)
        this.setState({diff: ((now - upd) / 60000)})
    }

    componentDidMount(){
        axios.get('/snack').then(response => {
            this.setState({ menu: response.data.snacks})
        })
        this.timerID = setInterval(() => this.tick(), 1000); // updates this DOM every second
    }

    componentWillUnmount(){
        clearInterval(this.timerID); // tear down timer so that interval starts over
    }
    
    handleShowOrderDetail = () => {
        console.log(this.props.order)
    }

    handleEditOrder = () => {
        console.log(this.state.diff)
        if (this.props.order.status === "outstanding" && this.state.diff <= 10){
            this.setState({editModalVisible: true});
        }
        if(this.props.order.status === "fulfilled") {
            notification.open({
                message: 'Order is ready to be collected!',
                description: 'You cannot make any changes to a fulfilled order. You can rate your experience after picking up the snacks',
                duration: 3

            });         
        }else if (this.props.order.status === "outstanding" && this.state.diff > 10){
            notification.open({
                message: 'Order is being processed!',
                description: 'You can only update your order within 10 minutes after placing the order.',
                duration: 3
            });
        }else{
            console.log(props.order)
            this.setState({editModalVisible: true});

        }
    }

    renderEditModalContent = () => {
        if(this.props.order.status === "outstanding"){
            return(
                <>
                <Modal.Header closeButton>
                    <Modal.Title>Menu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {this.state.menu.map((snack, index) =>(
                        <Card cover={<img alt="example" src={snack.image} />}style={{marginBottom:"2vh"}}size={"small"} key={snack._id}>
                            <Meta
                                title={snack.name + "    " + snack.price}
                            />
                            <Divider style={{borderWidth:5, borderColor: '#593e34' }} plain>
                            </Divider>
                            <Meta
                                description={snack.detail}
                            />
                            <InputNumber key ={snack._id} min={0} defaultValue={0} style ={{marginLeft:"80%"}} onChange={e => this.onChange(index, e)} />
                                
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => this.onOrderSubmit()}>
                        Submit
                    </Button>
                </Modal.Footer>
            </>
            )

        }else{
            return(
                <>
                    <Modal.Header closeButton>
                        <Modal.Title>{"OrderId: " + this.props.order._id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Vendor: {this.props.order.vendor._id}</p>
                        <p>Snacks: {this.props.order.snacks.map((snack) => <li key={snack.name}>{snack.name} - qty: {snack.qty}</li>)}</p>
                        <p>comment and rating</p>
                    </Modal.Body>
                </>
            )
        }
        
    }

    onOrderSubmit = () => {        
            var submitOrder = []       
            for (var i = 0; i < this.state.order.length; i++){
                if(Number.isFinite(this.state.order[i])){
                    submitOrder.push({
                        "name": this.state.menu[i].name,
                        "qty":this.state.order[i]
                    })
                }
            }
            if (submitOrder.length ===0){
                this.setState({editModalVisible: false });
                message.error("You need to enter more than one snack!")

            }else{
                //console.log(this.props.order.customer._id)
                axios.post('/order/'+this.props.order._id + '/update',{
                    //customer:this.props.order.customer.id,
                    //vendor: this.props.order.vendor.id, //will be changed in the future
                    status: "outstanding",
                    snacks: submitOrder
                }).then(response =>{
                    if(response.data.success){
                        message.success("Order has been placed!")
                        this.setState({editModalVisible: false });
                    }else{
                        message.error("Order placing errored!")
                    }
                })
            }
            
        
        
    }

    render() {
        return (
            <>
                <Modal show={this.state.modalVisible} onHide={() => this.handleClose()}>
                    <Modal.Header closeButton>
                        <Modal.Title>{"OrderId: " + this.props.order._id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Vendor: {this.props.order.vendor._id}</p>
                        <p>Snacks: {this.props.order.snacks.map((snack) => <li key={snack.name}>{snack.name} - qty: {snack.qty}</li>)}</p>
                    </Modal.Body>
                </Modal>
                <Modal show={this.state.editModatVisible} onHide={() => this.handleEditClose()}>
                   {this,this.renderEditModalContent()}
                </Modal>
                <Card style={{margin: "10px"}} 
                actions={[<EyeOutlined onClick = {() => this.handleShow()} />, 
                <EditOutlined onClick = {() => this.handleEditOrder()}/>]}>
                    <Meta  title={this.props.order.vendor._id + " - " + this.props.order.status}/>
                    {(this.props.order.status === "fulfilled") ? "Order is fulfilled"
                        : (this.props.order.status === "completed") ? "Order is completed"
                            :<CountUp updatedAt={this.props.order.updatedAt} />}

                </Card>
            </>
        )
    }
}